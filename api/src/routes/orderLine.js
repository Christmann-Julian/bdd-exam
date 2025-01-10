import { Router } from "express";

export const orderLineRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.query("SELECT * FROM order_line");
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .get("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const [rows] = await db.query(`SELECT * FROM order_line WHERE id = ${id}`);
        
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post("/", async (req, res) => {
      try {
        const { quantity, product_id, order_id } = req.body;

        const [result] = await db.query(`INSERT INTO order_line (quantity, product_id, order_id) VALUES (${quantity}, ${product_id}, ${order_id})`);

        res
          .status(201)
          .json({
            id: result.insertId,
            quantity,
            product_id,
            order_id,
          });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .put("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { quantity, product_id, order_id } = req.body;

        await db.query(`UPDATE order_line SET quantity = ${quantity}, product_id = ${product_id}, order_id = ${order_id} WHERE id = ${id}`);

        res.status(200).json({ id, quantity, product_id, order_id });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .delete("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        await db.query(`DELETE FROM order_line WHERE id = ${id}`);

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });