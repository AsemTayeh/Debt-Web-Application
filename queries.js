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

export async function verifyUserLogin(email, password) {
    const db = await connectDB();
    try {
      const [rows] = await db.execute(
        "SELECT ID, hashed_password FROM users WHERE username = ?",
        [email]
      );
  
      if (rows.length === 0) {
        console.log("User not found");
        return false;
      }
  
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.hashed_password);
  
      if (isMatch) {
        console.log(`Login successful for user ID: ${user.ID}`);
        return user.ID;
      } else {
        console.log("Incorrect password");
        return false;
      }
    } catch (err) {
      console.error("Error verifying user:", err);
    } finally {
      await db.end();
    }
  }