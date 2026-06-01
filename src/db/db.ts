import { drizzle } from "drizzle-orm/node-postgres"; 
import * as schema from "./schema";

const db = drizzle({
  connection: process.env.DATABASE_URL!,
  schema,
});
console.log("db initialised");

export default db;