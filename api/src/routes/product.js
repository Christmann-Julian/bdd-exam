import { Router } from "express";

export const productRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.query("SELECT * FROM product");
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .get("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const [rows] = await db.query(`SELECT * FROM product WHERE id = ${id}`);
        
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post("/", async (req, res) => {
      try {
        const { name, reference, price, stock, category_id } = req.body;

        const [result] = await db.query(`INSERT INTO product (name, reference, price, stock, category_id) VALUES ('${name}', '${reference}', ${price}, ${stock}, ${category_id})`);

        res
          .status(201)
          .json({
            id: result.insertId,
            name,
            reference,
            price,
            stock,
            category_id,
          });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .put("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { name, reference, price, stock, category_id } = req.body;

        await db.query(`UPDATE product SET name = '${name}', reference = '${reference}', price = ${price}, stock = ${stock}, category_id = ${category_id} WHERE id = ${id}`);

        res.status(200).json({ id, name, reference, price, stock, category_id });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .delete("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        await db.query(`DELETE FROM product WHERE id = ${id}`);

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });