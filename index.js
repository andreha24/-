import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { setupRoutes } from "./routes/index.js";
import { initializeWeb3 } from "./services/web3Service.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

await initializeWeb3();
setupRoutes(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
