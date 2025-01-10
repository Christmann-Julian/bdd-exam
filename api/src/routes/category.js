import { Router } from "express";
import { body, param, validationResult } from "express-validator";

export const categoryRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.execute("SELECT * FROM category");
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
        const [rows] = await db.execute("SELECT * FROM category WHERE id = ?", [id]);

        if (rows.length === 0) {
          return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post(
      "/",
      [body("name").isString().notEmpty()],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        try {
          const { name } = req.body;
          const [result] = await db.execute(
            "INSERT INTO category (name) VALUES (?)",
            [name]
          );

          res.status(201).json({
            id: result.insertId,
            name,
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
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        try {
          const { id } = req.params;
          const { name } = req.body;
          const [result] = await db.execute(
            "UPDATE category SET name = ? WHERE id = ?",
            [name, id]
          );

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found" });
          }

          res.status(200).json({ id, name });
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
        const [result] = await db.execute("DELETE FROM category WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Category not found" });
        }

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });