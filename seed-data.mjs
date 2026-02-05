import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log("Seeding database with sample data...");

// This script will be run manually to create test data
// For now, we'll just verify the connection works

console.log("✓ Database connection successful");
console.log("✓ Ready for testing");

await connection.end();
