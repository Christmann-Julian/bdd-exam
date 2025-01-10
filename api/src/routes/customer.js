import { Router } from "express";

export const customerRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.query("SELECT * FROM customer");
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .get("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const [rows] = await db.query(`SELECT * FROM customer WHERE id = ${id}`);
        
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post("/", async (req, res) => {
      try {
        const { firstname, lastname, adress, email, phone } = req.body;

        const [result] = await db.query(`INSERT INTO customer (firstname, lastname, adress, email, phone) VALUES ('${firstname}', '${lastname}', '${adress}', '${email}', '${phone}')`);

        res
          .status(201)
          .json({
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
    })
    .put("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { firstname, lastname, adress, email, phone } = req.body;

        await db.query(`UPDATE customer SET firstname = '${firstname}', lastname = '${lastname}', adress = '${adress}', email = '${email}', phone = '${phone}' WHERE id = ${id}`);

        res.status(200).json({ id, firstname, lastname, adress, email, phone });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .delete("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        await db.query(`DELETE FROM customer WHERE id = ${id}`);

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
