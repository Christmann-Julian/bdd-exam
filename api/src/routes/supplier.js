import { Router } from "express";

export const supplierRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.query("SELECT * FROM supplier");
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .get("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const [rows] = await db.query(`SELECT * FROM supplier WHERE id = ${id}`);
        
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post("/", async (req, res) => {
      try {
        const { name, adress, email, phone } = req.body;

        const [result] = await db.query(`INSERT INTO supplier (name, adress, email, phone) VALUES ('${name}', '${adress}', '${email}', '${phone}')`);

        res
          .status(201)
          .json({
            id: result.insertId,
            name,
            adress,
            email,
            phone,
          });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .put("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { name, adress, email, phone } = req.body;

        await db.query(`UPDATE supplier SET name = '${name}', adress = '${adress}', email = '${email}', phone = '${phone}' WHERE id = ${id}`);

        res.status(200).json({ id, name, adress, email, phone });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .delete("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        await db.query(`DELETE FROM supplier WHERE id = ${id}`);

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });