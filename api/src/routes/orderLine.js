import { Router } from "express";
import { body, param, validationResult } from "express-validator";

export const orderLineRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.execute("SELECT * FROM order_line");
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
        const [rows] = await db.execute("SELECT * FROM order_line WHERE id = ?", [id]);

        if (rows.length === 0) {
          return res.status(404).json({ message: "Order line not found" });
        }

        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post(
      "/",
      [
        body("quantity").isInt({ min: 1 }),
        body("product_id").isInt(),
        body("order_id").isInt(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        try {
          const { quantity, product_id, order_id } = req.body;
          const [result] = await db.execute(
            "INSERT INTO order_line (quantity, product_id, order_id) VALUES (?, ?, ?)",
            [quantity, product_id, order_id]
          );

          res.status(201).json({
            id: result.insertId,
            quantity,
            product_id,
            order_id,
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
        body("quantity").isInt({ min: 1 }),
        body("product_id").isInt(),
        body("order_id").isInt(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        try {
          const { id } = req.params;
          const { quantity, product_id, order_id } = req.body;
          const [result] = await db.execute(
            "UPDATE order_line SET quantity = ?, product_id = ?, order_id = ? WHERE id = ?",
            [quantity, product_id, order_id, id]
          );

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order line not found" });
          }

          res.status(200).json({ id, quantity, product_id, order_id });
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
        const [result] = await db.execute("DELETE FROM order_line WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Order line not found" });
        }

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });