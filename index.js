import express from "express";
import "dotenv/config";
import reportRoutes from "./src/routes/reportRoutes.js";

const app = express();

const port = process.env.PORT || 3000;

app.use("/api/reports", reportRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
