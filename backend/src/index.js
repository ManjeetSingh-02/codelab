// import package modules
import dotenv from "dotenv";

// import local modules
import app from "./app.js";
import { connectToDB } from "./utils/db/mongo.db.js";

//dotenv file config
dotenv.config({ path: "./.env" });

// PORT setup
const PORT = process.env.PORT || 5000;

// Connect to database and then start the server
connectToDB().then(() => app.listen(PORT, () => console.log(`Running on port ${PORT}`)));
