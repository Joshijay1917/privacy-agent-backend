import { app } from "./app.js";
import { connectToDB } from "./config/db.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);

  connectToDB()
  .then(() => {
    console.log("Connected To Database!!");
  })
  .catch(() => {
    console.error("Faied to connect Database!!");
  })
});