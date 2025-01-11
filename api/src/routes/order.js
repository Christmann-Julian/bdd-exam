import { Router } from "express";
import { body, param, validationResult } from "express-validator";

export const orderRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      const { start, end } = req.query;

      let query = `
    SELECT o.id as order_id, o.order_date, o.customer_id, o.reference, o.status, c.firstname, c.lastname, c.adress, c.email, c.phone, 
           ol.id as order_line_id, ol.quantity, p.name as product_name, p.reference, p.price
    FROM \`order\` o
    JOIN customer c ON o.customer_id = c.id
    LEFT JOIN order_line ol ON o.id = ol.order_id
    LEFT JOIN product p ON ol.product_id = p.id
  `;
      let queryParams = [];

      if (start && end) {
        query += " WHERE o.order_date BETWEEN ? AND ?";
        queryParams.push(start, end);
      } else if (start) {
        query += " WHERE o.order_date >= ?";
        queryParams.push(start);
      } else if (end) {
        query += " WHERE o.order_date <= ?";
        queryParams.push(end);
      }

      try {
        const [rows] = await db.execute(query, queryParams);

        const orders = rows.reduce((acc, row) => {
          const order = acc.find((o) => o.id === row.order_id);
          const orderLine = {
            id: row.order_line_id,
            quantity: row.quantity,
            product: {
              name: row.product_name,
              reference: row.reference,
              price: row.price,
            },
          };

          if (order) {
            order.order_lines.push(orderLine);
          } else {
            acc.push({
              id: row.order_id,
              reference: row.reference,
              status: row.status,
              order_date: row.order_date,
              customer: {
                id: row.customer_id,
                firstname: row.firstname,
                lastname: row.lastname,
                adress: row.adress,
                email: row.email,
                phone: row.phone,
              },
              order_lines: [orderLine],
            });
          }

          return acc;
        }, []);

        res.status(200).json(orders);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .get("/:id", [param("id").isInt()], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { id } = req.params;
        const [rows] = await db.execute(
          `
      SELECT o.id as order_id, o.order_date, o.customer_id, o.reference, o.status, c.firstname, c.lastname, c.adress, c.email, c.phone, 
             ol.id as order_line_id, ol.quantity, p.name as product_name, p.reference, p.price
      FROM \`order\` o
      JOIN customer c ON o.customer_id = c.id
      LEFT JOIN order_line ol ON o.id = ol.order_id
      LEFT JOIN product p ON ol.product_id = p.id
      WHERE o.id = ?
    `,
          [id]
        );

        if (rows.length === 0) {
          return res.status(404).json({ error: "Order not found" });
        }

        const order = {
          id: rows[0].order_id,
          reference: rows[0].reference,
          status: rows[0].status,
          order_date: rows[0].order_date,
          customer: {
            id: rows[0].customer_id,
            firstname: rows[0].firstname,
            lastname: rows[0].lastname,
            adress: rows[0].adress,
            email: rows[0].email,
            phone: rows[0].phone,
          },
          order_lines: rows.map((row) => ({
            id: row.order_line_id,
            quantity: row.quantity,
            product: {
              name: row.product_name,
              reference: row.reference,
              price: row.price,
            },
          })),
        };

        res.status(200).json(order);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post(
      "/",
      [body("reference").isString().notEmpty(),body("order_date").isISO8601().toDate(), body("customer_id").isInt()],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        try {
          const { reference, order_date, customer_id } = req.body;
          const [result] = await db.execute(
            "INSERT INTO `order` (reference, order_date, customer_id) VALUES (?, ?, ?)",
            [reference, order_date, customer_id]
          );

          res.status(201).json({
            id: result.insertId,
            reference,
            order_date,
            customer_id,
          });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
    )
    .put(
      "/:id",
      [
        param("id").isInt(),
        body("reference").isString().notEmpty(),
        body("status").isString().notEmpty(),
        body("order_date").isISO8601().toDate(),
        body("customer_id").isInt(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        try {
          const { id } = req.params;
          const {reference, status, order_date, customer_id } = req.body;
          const [result] = await db.execute(
            "UPDATE `order` SET reference = ? status = ? order_date = ?, customer_id = ? WHERE id = ?",
            [reference, status, order_date, customer_id, id]
          );

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
          }

          res.status(200).json({ id, reference, order_date, status, customer_id });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
    )
    .delete("/:id", [param("id").isInt()], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { id } = req.params;

        await db.beginTransaction();

        await db.execute("DELETE FROM `order_line` WHERE order_id = ?", [id]);
        const [result] = await db.execute("DELETE FROM `order` WHERE id = ?", [
          id,
        ]);

        if (result.affectedRows === 0) {
          await db.rollback();
          return res.status(404).json({ message: "Order not found" });
        }

        await db.commit();

        res.status(204).send();
      } catch (error) {
        await db.rollback();
        res.status(500).json({ error: error.message });
      }
    });
