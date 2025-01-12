import bcrypt from "bcrypt";
import { Router } from "express";
import { body, param, validationResult } from "express-validator";

export const userRouter = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const query = "SELECT * FROM user;";
        const [results] = await db.query(query);
        res.status(200).json(results);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
      }
    })
    .get("/:id", [param("id").isInt()], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { id } = req.params;
        const query = "SELECT * FROM user WHERE id = ?";
        const [results] = await db.query(query, [id]);

        if (results.length === 0) {
          return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(results[0]);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
      }
    })
    .patch(
      "/:id",
      [
        param("id").isInt(),
        body("lastname").isString().optional(),
        body("firstname").isString().optional(),
        body("email").isEmail().optional(),
        body("password").isString().optional(),
        body("role").isString().optional(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        try {
          const { id } = req.params;
          const { lastname, firstname, email, password, role } = req.body;
          let query =
            "UPDATE user SET lastname = ?, firstname = ?, email = ?, role = ? WHERE id = ?";
          const queryParams = [lastname, firstname, email, role, id];

          if (password && password !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            query =
              "UPDATE user SET lastname = ?, firstname = ?, email = ?, password = ?, role = ? WHERE id = ?";
            queryParams.splice(3, 0, hashedPassword);
          }

          const [result] = await db.query(query, queryParams);

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found." });
          }

          res.json({ id, lastname, firstname, email, role });
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "Server error"});
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
        const query = "DELETE FROM user WHERE id = ?";
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "User not found." });
        }

        res.status(204).send();
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error"});
      }
    });
