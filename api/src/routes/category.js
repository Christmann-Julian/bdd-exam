import { Router } from "express";

export const categoryRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.query("SELECT * FROM category");
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .get("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const [rows] = await db.query(`SELECT * FROM category WHERE id = ${id}`);
        
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post("/", async (req, res) => {
      try {
        const { name } = req.body;

        const [result] = await db.query(`INSERT INTO category (name) VALUES ('${name}')`);

        res
          .status(201)
          .json({
            id: result.insertId,
            name,
          });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .put("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { name } = req.body;

        await db.query(`UPDATE category SET name = '${name}' WHERE id = ${id}`);

        res.status(200).json({ id, name });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .delete("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        await db.query(`DELETE FROM category WHERE id = ${id}`);

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });