import cors from "cors";
import express from "express";
import mysql from "mysql2/promise";
import { customerRoutes } from "./routes/customer.js";
import { categoryRoutes } from "./routes/category.js";
import { orderRoutes } from "./routes/order.js";
import { orderLineRoutes } from "./routes/orderLine.js";
import { productRoutes } from "./routes/product.js";
import { supplierRoutes } from "./routes/supplier.js";
import { searchRoutes } from "./routes/search.js";
import { statisticRoutes } from "./routes/statistic.js";
import { authenticateToken, authorizeRole } from "./middlewares/auth.js";
import { authRouter } from "./routes/auth.js";
import { userRouter } from "./routes/user.js";

const app = express();
const port = 3001;

(async () => {
    try {
      const connection = await mysql.createConnection({
        host: "localhost",
        database: "bdd-exam",
        user: "root",
        password: "",
      });
  
      app
        .use(cors())
        .use(express.json())
        .use("/api/auth", authRouter(connection))
        .use(authenticateToken)
        .use("/api/categories", categoryRoutes(connection), authorizeRole(["admin", "user"]))
        .use("/api/suppliers", supplierRoutes(connection), authorizeRole(["admin", "user"]))
        .use("/api/customers", customerRoutes(connection), authorizeRole(["admin", "user"]))
        .use("/api/orders", orderRoutes(connection), authorizeRole(["admin", "user"]))
        .use("/api/order-lines", orderLineRoutes(connection), authorizeRole(["admin", "user"]))
        .use("/api/products", productRoutes(connection), authorizeRole(["admin", "user"]))
        .use("/api/search", searchRoutes(connection), authorizeRole(["admin", "user"]))
        .use("/api/statistics", statisticRoutes(connection), authorizeRole(["admin", "user"]))
        .use("/api/users", authorizeRole(["admin"]), userRouter(connection))
        .listen(port, () => {
          console.log(`Server is running on port ${port}`);
        });
  
    } catch (error) {
      console.error('Error connecting to the database:', error.message);
      process.exit(1);
    }
})();
