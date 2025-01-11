import { Router } from "express";
import { body, param, validationResult } from "express-validator";

export const orderLineRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.execute(
          `SELECT order_line.*, product.id as product_id, product.name as product_name, product.reference, product.price, product.stock, product.category_id, category.name as category_name
           FROM order_line 
           JOIN product ON order_line.product_id = product.id
           JOIN category ON product.category_id = category.id`
        );

        const result = rows.map((row) => ({
          id: row.id,
          quantity: row.quantity,
          order_id: row.order_id,
          product: {
            id: row.product_id,
            name: row.product_name,
            reference: row.reference,
            price: row.price,
            stock: row.stock,
            category_id: row.category_id,
            category_name: row.category_name,
          },
        }));

        res.status(200).json(result);
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
        const [rows] = await db.execute(
          `SELECT order_line.*, product.id as product_id, product.name as product_name, product.reference, product.price, product.stock, product.category_id, category.name as category_name 
           FROM order_line 
           JOIN product ON order_line.product_id = product.id 
           JOIN category ON product.category_id = category.id
           WHERE order_line.id = ?`,
          [id]
        );

        if (rows.length === 0) {
          return res.status(404).json({ message: "Order line not found" });
        }

        const result = rows.map((row) => ({
          id: row.id,
          quantity: row.quantity,
          order_id: row.order_id,
          product: {
            id: row.product_id,
            name: row.product_name,
            reference: row.reference,
            price: row.price,
            stock: row.stock,
            category_id: row.category_id,
            category_name: row.category_name
          },
        }));

        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post(
      "/",
      [
        body("quantity").isInt({ min: 1 }),
        body("product_id").isInt(),
        body("order_id").isInt(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        await db.beginTransaction();

        try {
          const { quantity, product_id, order_id } = req.body;

          const [product] = await db.execute(
            "SELECT stock FROM product WHERE id = ? FOR UPDATE",
            [product_id]
          );

          if (product.length === 0 || product[0].stock < quantity) {
            await db.rollback();
            return res
              .status(400)
              .json({ error: "Product is out of stock or insufficient stock" });
          }

          const [result] = await db.execute(
            "INSERT INTO order_line (quantity, product_id, order_id) VALUES (?, ?, ?)",
            [quantity, product_id, order_id]
          );

          await db.execute(
            "UPDATE product SET stock = stock - ? WHERE id = ?",
            [quantity, product_id]
          );

          await db.commit();

          res.status(201).json({
            id: result.insertId,
            quantity,
            product_id,
            order_id,
          });
        } catch (err) {
          await db.rollback();
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    )
    .put(
      "/:id",
      [
        param("id").isInt(),
        body("quantity").isInt({ min: 1 }),
        body("product_id").isInt(),
        body("order_id").isInt(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        await db.beginTransaction();

        try {
          const { quantity, product_id, order_id } = req.body;
          const { id } = req.params;

          const [product] = await db.execute(
            "SELECT stock FROM product WHERE id = ? FOR UPDATE",
            [product_id]
          );

          if (product.length === 0 || product[0].stock < quantity) {
            await db.rollback();
            return res
              .status(400)
              .json({ error: "Product is out of stock or insufficient stock" });
          }

          const [result] = await db.execute(
            "UPDATE order_line SET quantity = ?, product_id = ?, order_id = ? WHERE id = ?",
            [quantity, product_id, order_id, id]
          );

          await db.execute(
            "UPDATE product SET stock = stock - ? WHERE id = ?",
            [quantity, product_id]
          );

          await db.commit();

          res.status(200).json({
            id,
            quantity,
            product_id,
            order_id,
          });
        } catch (err) {
          await db.rollback();
          res.status(500).json({ error: "Internal Server Error" });
        } finally {
          db.release();
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
        const [result] = await db.execute(
          "DELETE FROM order_line WHERE id = ?",
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Order line not found" });
        }

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
