import { Router } from "express";

export const orderRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.query("SELECT * FROM `order`");
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .get("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const [rows] = await db.query(`SELECT * FROM \`order\` WHERE id = ${id}`);
        
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post("/", async (req, res) => {
      try {
        const { order_date, customer_id } = req.body;

        const [result] = await db.query(`INSERT INTO \`order\` (order_date, customer_id) VALUES ('${order_date}', ${customer_id})`);

        res
          .status(201)
          .json({
            id: result.insertId,
            order_date,
            customer_id,
          });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .put("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { order_date, customer_id } = req.body;

        await db.query(`UPDATE \`order\` SET order_date = '${order_date}', customer_id = ${customer_id} WHERE id = ${id}`);

        res.status(200).json({ id, order_date, customer_id });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .delete("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        await db.query(`DELETE FROM \`order\` WHERE id = ${id}`);

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });