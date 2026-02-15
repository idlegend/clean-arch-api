import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./interfaces/shared/middleware/errorHandler";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(routes);

app.use(errorHandler);

app.listen(3000, () => console.log("Server running on 3000"));
