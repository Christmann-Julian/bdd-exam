import cors from "cors";
import express from "express";
import mysql from "mysql2/promise";

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
        .listen(port, () => {
          console.log(`Server is running on port ${port}`);
        });
  
    } catch (error) {
      console.error('Error connecting to the database:', error.message);
      process.exit(1);
    }
})();
