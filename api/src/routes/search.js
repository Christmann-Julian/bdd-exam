import { Router } from "express";
import { query, validationResult } from "express-validator";

export const searchRoutes = (db) =>
  Router().get(
    "/",
    [
      query("client").optional().isString(),
      query("start_date").optional().isISO8601(),
      query("end_date").optional().isISO8601(),
      query("status").optional().isString(),
      query("product").optional().isString(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { client, start_date, end_date, status, product } = req.query;

      let query = `
        SELECT o.id as order_id, o.order_date, o.status, c.firstname, c.lastname, 
               p.id as product_id, p.name as product_name, p.reference as product_reference, p.price
        FROM \`order\` o
        JOIN customer c ON o.customer_id = c.id
        LEFT JOIN order_line ol ON o.id = ol.order_id
        LEFT JOIN product p ON ol.product_id = p.id
        WHERE 1=1
      `;
      let queryParams = [];

      if (client) {
        query += " AND (c.firstname LIKE ? OR c.lastname LIKE ?)";
        queryParams.push(`%${client}%`, `%${client}%`);
      }
      if (start_date) {
        query += " AND o.order_date >= ?";
        queryParams.push(start_date);
      }
      if (end_date) {
        query += " AND o.order_date <= ?";
        queryParams.push(end_date);
      }
      if (status) {
        query += " AND o.status = ?";
        queryParams.push(status);
      }
      if (product) {
        query += " AND p.name LIKE ?";
        queryParams.push(`%${product}%`);
      }

      try {
        const [rows] = await db.execute(query, queryParams);

        const orders = rows.reduce((acc, row) => {
          let order = acc.find((o) => o.order_id === row.order_id);
          if (!order) {
            order = {
              order_id: row.order_id,
              order_date: row.order_date,
              status: row.status,
              customer: {
                id: row.customer_id,
                firstname: row.firstname,
                lastname: row.lastname,
              },
              products: [],
            };
            acc.push(order);
          }
          if (row.product_id) {
            order.products.push({
              id: row.product_id,
              name: row.product_name,
              reference: row.product_reference,
              price: row.price,
            });
          }
          return acc;
        }, []);
        res.status(200).json(orders);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
