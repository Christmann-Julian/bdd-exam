import { Router } from "express";
import { query, validationResult } from "express-validator";

export const statisticRoutes = (db) =>
  Router()
    .get(
      "/total-sales",
      [
        query("start_date").optional().isISO8601(),
        query("end_date").optional().isISO8601(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { start_date, end_date } = req.query;

        let salesQuery = `
        SELECT SUM(ol.quantity * p.price) as total_amount, SUM(ol.quantity) as total_quantity
        FROM order_line ol
        JOIN product p ON ol.product_id = p.id
        JOIN \`order\` o ON ol.order_id = o.id
        WHERE 1=1
      `;
        let queryParams = [];

        if (start_date) {
          salesQuery += " AND o.order_date >= ?";
          queryParams.push(start_date);
        }
        if (end_date) {
          salesQuery += " AND o.order_date <= ?";
          queryParams.push(end_date);
        }

        try {
          const [salesResult] = await db.execute(salesQuery, queryParams);
          res.status(200).json({ total_amount: salesResult[0].total_amount, total_quantity: salesResult[0].total_quantity });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
    )
    .get(
      "/top-products",
      [
        query("start_date").optional().isISO8601(),
        query("end_date").optional().isISO8601(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { start_date, end_date } = req.query;

        let productsQuery = `
        SELECT p.id, p.name, SUM(ol.quantity) as total_quantity_sales
        FROM order_line ol
        JOIN product p ON ol.product_id = p.id
        JOIN \`order\` o ON ol.order_id = o.id
        WHERE 1=1
      `;
        let queryParams = [];

        if (start_date) {
          productsQuery += " AND o.order_date >= ?";
          queryParams.push(start_date);
        }
        if (end_date) {
          productsQuery += " AND o.order_date <= ?";
          queryParams.push(end_date);
        }

        productsQuery += `
        GROUP BY p.id, p.name
        ORDER BY total_quantity_sales DESC
        LIMIT 5
      `;

        try {
          const [productsResult] = await db.execute(productsQuery, queryParams);
          res.status(200).json(productsResult);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
    );
