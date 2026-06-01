import "dotenv/config";

import { seedDb } from "./db/seed";
import app from "./server";

// Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
