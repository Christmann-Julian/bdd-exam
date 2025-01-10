import { Router } from "express";
import { body, param, validationResult } from "express-validator";

export const supplierRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.execute("SELECT * FROM supplier");
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
        const [rows] = await db.execute("SELECT * FROM supplier WHERE id = ?", [id]);

        if (rows.length === 0) {
          return res.status(404).json({ message: "Supplier not found" });
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
        body("adress").isString().notEmpty(),
        body("email").isEmail(),
        body("phone").isString().notEmpty(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        try {
          const { name, adress, email, phone } = req.body;
          const [result] = await db.execute(
            "INSERT INTO supplier (name, adress, email, phone) VALUES (?, ?, ?, ?)",
            [name, adress, email, phone]
          );

          res.status(201).json({
            id: result.insertId,
            name,
            adress,
            email,
            phone,
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
        body("adress").isString().notEmpty(),
        body("email").isEmail(),
        body("phone").isString().notEmpty(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        try {
          const { id } = req.params;
          const { name, adress, email, phone } = req.body;
          const [result] = await db.execute(
            "UPDATE supplier SET name = ?, adress = ?, email = ?, phone = ? WHERE id = ?",
            [name, adress, email, phone, id]
          );

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Supplier not found" });
          }

          res.status(200).json({ id, name, adress, email, phone });
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
        const [result] = await db.execute("DELETE FROM supplier WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Supplier not found" });
        }

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });