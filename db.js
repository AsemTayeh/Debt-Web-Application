import mysql from "mysql2/promise";

// Create and export the connection function
export async function connectDB() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "root",
      database: "debtwebapp",
    });
    console.log("Connected to the database");
    return connection;
  } catch (err) {
    console.error("Error connecting to database: ", err.stack);
    throw err;
  }
}
