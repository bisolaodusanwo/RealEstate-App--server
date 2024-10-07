import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import { DATABASE } from "./config.js";
import authRoutes from "./routes/auth.js";

const app = express();

//connect to mongodb
// mongoose.set("strictQuery", false);
mongoose
  .connect(DATABASE)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB connection error", err));
//middlewares
app.use(express.json()); //when post request from client to server, sending some data, we need to parse it to json
app.use(morgan("dev")); //"dev" for development and its going to show us the request in the console
app.use(cors()); //to allow the client to make request to the server

//routes middeleware

app.use("/api", authRoutes);

app.listen(8000, () => console.log("Server is running on port 8000")); //port 8000 is the port where the server is running
