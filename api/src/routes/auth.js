import bcrypt from "bcrypt";
import { Router } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "1957abg973poh";

export const authRouter = (db) =>
  Router()
    .post("/register", async (req, res) => {
        const { lastname, firstname, email, password, role } = req.body;

        if (!lastname || !firstname || !email || !password || !role) {
          return res.status(400).json({ message: "All fields are required." });
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);

          const query =
            "INSERT INTO user (lastname, firstname, email, password, role) VALUES (?, ?, ?, ?, ?)";
          const [result] = await db.query(query, [
            lastname,
            firstname,
            email,
            hashedPassword,
            role,
          ]);

          res.status(201).json({ message: "User created !" });
        } catch (error) {
          res.status(500).json({ message: "Error server "});
        }
      }
    )
    .post("/login", async (req, res) => {
      const { email, password } = req.body;

      try {
        const query = "SELECT * FROM user WHERE email = ?";
        const [rows] = await db.query(query, [email]);

        if (rows.length === 0) {
          return res.status(404).json({ message: "User not found." });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
          return res.status(401).json({ message: "Invalid password." });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
          expiresIn: "1h",
        });
        res.status(200).json({ message: "Login success", token });
      } catch (error) {
        res.status(500).json({ message: "Error during login"});
      }
    });
