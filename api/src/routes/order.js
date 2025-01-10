import { Router } from "express";
import { body, param, validationResult } from "express-validator";

export const orderRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.execute("SELECT * FROM `order`");
        res.status(200).json(rows);
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
        const [rows] = await db.execute("SELECT * FROM `order` WHERE id = ?", [
          id,
        ]);

        if (rows.length === 0) {
          return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post(
      "/",
      [body("order_date").isISO8601().toDate(), body("customer_id").isInt()],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        try {
          const { order_date, customer_id } = req.body;
          const [result] = await db.execute(
            "INSERT INTO `order` (order_date, customer_id) VALUES (?, ?)",
            [order_date, customer_id]
          );

          res.status(201).json({
            id: result.insertId,
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
          const { order_date, customer_id } = req.body;
          const [result] = await db.execute(
            "UPDATE `order` SET order_date = ?, customer_id = ? WHERE id = ?",
            [order_date, customer_id, id]
          );

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
          }

          res.status(200).json({ id, order_date, customer_id });
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
        const [result] = await db.execute("DELETE FROM `order` WHERE id = ?", [
          id,
        ]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Order not found" });
        }

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
