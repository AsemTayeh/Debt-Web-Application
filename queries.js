import {connectDB} from "./db.js"
import bcrypt from "bcrypt";

export async function createUser(name, password) {
    const db = await connectDB();
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const [result] = await db.execute(
          "INSERT INTO users (username, hashed_password) VALUES (?, ?)", 
          [name, hashedPassword]
        );
        console.log(`User added with ID: ${result.insertId}`);
      } catch (err) {
        console.error("Error adding user:", err);
      } finally {
        await db.end();
      }
}
export async function verifyUsername(name) {
    const db = await connectDB();
    try {
        const [result] = await db.execute(
          "SELECT username FROM users WHERE username = ?", 
          [name]
        );
        if (result.length === 0) {
            return false;
        } else {
            return true;
          }
      } catch (err) {
        console.error("Error adding user:", err);
      } finally {
        await db.end();
      }
}