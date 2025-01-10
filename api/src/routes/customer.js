import { Router } from "express";
import { body, param, validationResult } from "express-validator";

export const customerRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.execute("SELECT * FROM customer");
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
        const [rows] = await db.execute("SELECT * FROM customer WHERE id = ?", [
          id,
        ]);

        if (rows.length === 0) {
          return res.status(404).json({ message: "Customer not found" });
        }

        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post(
      "/",
      [
        body("firstname").isString().notEmpty(),
        body("lastname").isString().notEmpty(),
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
          const { firstname, lastname, adress, email, phone } = req.body;
          const [result] = await db.execute(
            "INSERT INTO customer (firstname, lastname, adress, email, phone) VALUES (?, ?, ?, ?, ?)",
            [firstname, lastname, adress, email, phone]
          );

          res.status(201).json({
            id: result.insertId,
            firstname,
            lastname,
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
        body("firstname").isString().notEmpty(),
        body("lastname").isString().notEmpty(),
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
          const { firstname, lastname, adress, email, phone } = req.body;
          const [result] = await db.execute(
            "UPDATE customer SET firstname = ?, lastname = ?, adress = ?, email = ?, phone = ? WHERE id = ?",
            [firstname, lastname, adress, email, phone, id]
          );

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Customer not found" });
          }

          res
            .status(200)
            .json({ id, firstname, lastname, adress, email, phone });
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
        const [result] = await db.execute("DELETE FROM customer WHERE id = ?", [
          id,
        ]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Customer not found" });
        }

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
