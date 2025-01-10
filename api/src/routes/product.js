import { Router } from "express";
import { body, param, validationResult } from "express-validator";

export const productRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.execute("SELECT * FROM product");
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
        const [rows] = await db.execute("SELECT * FROM product WHERE id = ?", [id]);

        if (rows.length === 0) {
          return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post(
      "/",
      [
        body("name").isString().notEmpty(),
        body("reference").isString().notEmpty(),
        body("price").isFloat({ min: 0 }),
        body("stock").isInt({ min: 0 }),
        body("category_id").isInt(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        try {
          const { name, reference, price, stock, category_id } = req.body;
          const [result] = await db.execute(
            "INSERT INTO product (name, reference, price, stock, category_id) VALUES (?, ?, ?, ?, ?)",
            [name, reference, price, stock, category_id]
          );

          res.status(201).json({
            id: result.insertId,
            name,
            reference,
            price,
            stock,
            category_id,
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
        body("name").isString().notEmpty(),
        body("reference").isString().notEmpty(),
        body("price").isFloat({ min: 0 }),
        body("stock").isInt({ min: 0 }),
        body("category_id").isInt(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        try {
          const { id } = req.params;
          const { name, reference, price, stock, category_id } = req.body;
          const [result] = await db.execute(
            "UPDATE product SET name = ?, reference = ?, price = ?, stock = ?, category_id = ? WHERE id = ?",
            [name, reference, price, stock, category_id, id]
          );

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
          }

          res.status(200).json({ id, name, reference, price, stock, category_id });
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
        const [result] = await db.execute("DELETE FROM product WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Product not found" });
        }

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });