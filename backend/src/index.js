// import local modules
import { envConfig, validateEnv } from "./utils/env.js";
import app from "./app.js";
import { connectToDB } from "./utils/db/mongo.db.js";

// Connect to database and then start the server
validateEnv()
  .then(() => connectToDB())
  .then(() => {
    app.listen(envConfig.PORT, () => console.log(`Server running on PORT ${envConfig.PORT}: ✅`));
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
