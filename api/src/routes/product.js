import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";

export const productRoutes = (db) =>
  Router()
    .get("/", async (req, res) => {
      try {
        const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name, s.id as supplier_id, s.name as supplier_name, s.adress as supplier_adress, s.email as supplier_email, s.phone as supplier_phone
      FROM product p
      JOIN category c ON p.category_id = c.id
      LEFT JOIN product_supplier ps ON p.id = ps.product_id
      LEFT JOIN supplier s ON ps.supplier_id = s.id
    `);

        const products = rows.reduce((acc, row) => {
          let product = acc.find((p) => p.id === row.id);
          const supplier = {
            id: row.supplier_id,
            name: row.supplier_name,
            adress: row.supplier_adress,
            email: row.supplier_email,
            phone: row.supplier_phone,
          };

          if (product) {
            if (row.supplier_id) {
              product.suppliers.push(supplier);
            }
          } else {
            product = {
              id: row.id,
              name: row.name,
              reference: row.reference,
              price: row.price,
              stock: row.stock,
              category: {
                id: row.category_id,
                name: row.category_name,
              },
              suppliers: row.supplier_id ? [supplier] : [],
            };
            acc.push(product);
          }

          return acc;
        }, []);

        res.status(200).json(products);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .get(
      "/low-stock",
      [query("threshold").isInt({ min: 0 }).withMessage('Threshold must be a non-negative integer')],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const threshold = req.query.threshold ? parseInt(req.query.threshold, 10) : 10;

        try {
          const query = `
          SELECT id, name, reference, price, stock
          FROM product
          WHERE stock < ?
        `;
          const [rows] = await db.execute(query, [threshold]);

          res.status(200).json(rows);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
    )
    .get("/:id", [param("id").isInt()], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { id } = req.params;
        const [rows] = await db.execute(
          `
      SELECT p.*, c.name as category_name, s.id as supplier_id, s.name as supplier_name, s.adress as supplier_adress, s.email as supplier_email, s.phone as supplier_phone
      FROM product p
      JOIN category c ON p.category_id = c.id
      LEFT JOIN product_supplier ps ON p.id = ps.product_id
      LEFT JOIN supplier s ON ps.supplier_id = s.id
      WHERE p.id = ?
    `,
          [id]
        );

        if (rows.length === 0) {
          return res.status(404).json({ message: "Product not found" });
        }

        const product = {
          id: rows[0].id,
          name: rows[0].name,
          reference: rows[0].reference,
          price: rows[0].price,
          stock: rows[0].stock,
          category: {
            id: rows[0].category_id,
            name: rows[0].category_name,
          },
          suppliers: rows[0].supplier_id
            ? rows.map((row) => ({
                id: row.supplier_id,
                name: row.supplier_name,
                adress: row.supplier_adress,
                email: row.supplier_email,
                phone: row.supplier_phone,
              }))
            : [],
        };

        res.status(200).json(product);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })
    .post(
      "/",
      [
        body("name").isString().notEmpty(),
        body("reference").isString().notEmpty(),
        body("price").isFloat({ min: 0 }),
        body("stock").isInt({ min: 0 }),
        body("category_id").isInt(),
        body("supplier_ids"),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { name, reference, price, stock, category_id, supplier_ids } =
          req.body;

        try {
          await db.beginTransaction();

          if (supplier_ids && supplier_ids.length > 0) {
            const placeholders = supplier_ids.map(() => "?").join(",");
            const [suppliers] = await db.execute(
              `SELECT id FROM supplier WHERE id IN (${placeholders})`,
              supplier_ids
            );

            if (suppliers.length !== supplier_ids.length) {
              await db.rollback();
              return res
                .status(400)
                .json({ message: "One or more suppliers do not exist" });
            }
          }

          const [result] = await db.execute(
            "INSERT INTO product (name, reference, price, stock, category_id) VALUES (?, ?, ?, ?, ?)",
            [name, reference, price, stock, category_id]
          );

          const productId = result.insertId;

          if (supplier_ids && supplier_ids.length > 0) {
            await db.execute(
              "DELETE FROM product_supplier WHERE product_id = ?",
              [productId]
            );

            const supplierValues = supplier_ids.map((supplier_id) => [
              productId,
              supplier_id,
            ]);

            const placeholders = supplierValues.map(() => "(?, ?)").join(", ");
            const flattenedValues = supplierValues.flat();

            await db.execute(
              `INSERT INTO product_supplier (product_id, supplier_id) VALUES ${placeholders}`,
              flattenedValues
            );
          }

          await db.commit();

          res.status(201).json({
            id: productId,
            name,
            reference,
            price,
            stock,
            category_id,
            supplier_ids: supplier_ids || [],
          });
        } catch (error) {
          await db.rollback();
          res.status(500).json({ error: error.message });
        }
      }
    )
    .put(
      "/:id",
      [
        param("id").isInt(),
        body("name").isString().notEmpty(),
        body("reference").isString().notEmpty(),
        body("price").isFloat({ min: 0 }),
        body("stock").isInt({ min: 0 }),
        body("category_id").isInt(),
        body("supplier_ids").isArray(),
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { name, reference, price, stock, category_id, supplier_ids } =
          req.body;

        try {
          await db.beginTransaction();

          if (supplier_ids && supplier_ids.length > 0) {
            const placeholders = supplier_ids.map(() => "?").join(",");
            const [suppliers] = await db.execute(
              `SELECT id FROM supplier WHERE id IN (${placeholders})`,
              supplier_ids
            );

            if (suppliers.length !== supplier_ids.length) {
              await db.rollback();
              return res
                .status(400)
                .json({ message: "One or more suppliers do not exist" });
            }
          }

          await db.execute(
            "UPDATE product SET name = ?, reference = ?, price = ?, stock = ?, category_id = ? WHERE id = ?",
            [name, reference, price, stock, category_id, id]
          );

          await db.execute(
            "DELETE FROM product_supplier WHERE product_id = ?",
            [id]
          );

          if (supplier_ids && supplier_ids.length > 0) {
            const supplierValues = supplier_ids.map((supplier_id) => [
              productId,
              supplier_id,
            ]);

            const placeholders = supplierValues.map(() => "(?, ?)").join(", ");
            const flattenedValues = supplierValues.flat();

            await db.execute(
              `INSERT INTO product_supplier (product_id, supplier_id) VALUES ${placeholders}`,
              flattenedValues
            );
          }

          await db.commit();

          res.status(200).json({
            id,
            name,
            reference,
            price,
            stock,
            category_id,
            supplier_ids: supplier_ids || [],
          });
        } catch (error) {
          await db.rollback();
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

        await db.beginTransaction();

        await db.execute("DELETE FROM product_supplier WHERE product_id = ?", [
          id,
        ]);

        const [result] = await db.execute("DELETE FROM product WHERE id = ?", [
          id,
        ]);

        if (result.affectedRows === 0) {
          await db.rollback();
          return res.status(404).json({ message: "Product not found" });
        }

        await db.commit();

        res.status(204).send();
      } catch (error) {
        await db.rollback();
        res.status(500).json({ error: error.message });
      }
    })
    .get("/:id/orders", [param("id").isInt()], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { id } = req.params;
        const query = `
          SELECT o.id as order_id, o.order_date, o.customer_id, c.firstname, c.lastname, c.adress, c.email, c.phone, 
                 ol.id as order_line_id, ol.quantity, p.name as product_name, p.reference, p.price
          FROM \`order\` o
          JOIN customer c ON o.customer_id = c.id
          LEFT JOIN order_line ol ON o.id = ol.order_id
          LEFT JOIN product p ON ol.product_id = p.id
          WHERE p.id = ?
        `;
        const [rows] = await db.execute(query, [id]);

        const orders = rows.reduce((acc, row) => {
          const order = acc.find((o) => o.id === row.order_id);
          const orderLine = {
            id: row.order_line_id,
            quantity: row.quantity,
            product: {
              name: row.product_name,
              reference: row.reference,
              price: row.price,
            },
          };

          if (order) {
            order.order_lines.push(orderLine);
          } else {
            acc.push({
              id: row.order_id,
              order_date: row.order_date,
              customer: {
                id: row.customer_id,
                firstname: row.firstname,
                lastname: row.lastname,
                adress: row.adress,
                email: row.email,
                phone: row.phone,
              },
              order_lines: [orderLine],
            });
          }

          return acc;
        }, []);

        res.status(200).json(orders);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
