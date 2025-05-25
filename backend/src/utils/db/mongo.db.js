// import package modules
import mongoose from "mongoose";

// import local modules
import { envConfig } from "../env.js";

// function to connect to the database
export async function connectToDB() {
  await mongoose
    .connect(envConfig.MONGO_URI)
    .then(() => console.log("Connection to DataBase: ✅"))
    .catch(error => {
      throw new Error(`Connection to DataBase: ❌\n${error.message}`);
    });
}
