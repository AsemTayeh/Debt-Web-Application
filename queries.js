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
        const lastInsertedId = result.insertId;
        console.log("Last Inserted ID:", lastInsertedId);
        return lastInsertedId;
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

  export async function getUserName(id) {
    const db = await connectDB();
    try {
      const [rows] = await db.execute(
        "SELECT username FROM users WHERE ID = ?",
        [id]
      );
  
      if (rows.length === 0) {
        console.log("User not found");
        return false;
      } else {
        return rows[0].username;
      }
    } catch (err) {
      console.error("Error verifying user:", err);
    } finally {
      await db.end();
    }
  }

  export async function getDebts(id) {
    const db = await connectDB();
    try {
      const [rows] = await db.execute(
        "SELECT ID, amount, note FROM debtrecords WHERE userID = ?",
        [id]
      );
      return rows;
    } catch (err) {
      console.error("Error verifying user:", err);
    } finally {
      await db.end();
    }
  }
  export function setMessage(loginType) {
    let message = "";
    if (loginType === "login") {
        message = "Welcome back ";
    } else {
      message = "Welcome ";
    }
    return message;
  }

  export async function verifyUserExistence(id) {
    const db = await connectDB();
    try {
      const [rows] = await db.execute(
        "SELECT username FROM users WHERE ID = ?",
        [id]
      );
  
      if (rows.length === 0) {
        console.log("User not found in verifyUser");
        return false;
      } else {
        return true;
      }
    } catch (err) {
      console.error("Error verifying user:", err);
    } finally {
      await db.end();
    }
  }

  export async function insertRecord(value, note, userID) {
    const userExists = await verifyUserExistence(userID);
    if (!userExists) {
      console.log("User not found in insertRecord");
      return false;
    }
    const db = await connectDB();
    try {
        const [result] = await db.execute(
          "INSERT INTO debtrecords (amount, note, userID) VALUES (?, ?, ?)", 
          [value, note, userID]
        );
        const lastInsertedId = result.insertId;
        console.log("Last Inserted ID:", lastInsertedId);
        return lastInsertedId;
      } catch (err) {
        console.error("Error adding user:", err);
      } finally {
        await db.end();
      }
  }

  export async function verifyRecordExistence(id) {
    const db = await connectDB();
    try {
      const [rows] = await db.execute(
        "SELECT amount FROM debtrecords WHERE ID = ?",
        [id]
      );
  
      if (rows.length === 0) {
        console.log("record not found in verifyRecord");
        return false;
      } else {
        return true;
      }
    } catch (err) {
      console.error("Error verifying user:", err);
    } finally {
      await db.end();
    }
  }

  export async function checkIfUserCanViewRecord(recordID, userID) {
    const userExists = await verifyUserExistence(userID);
    if (!userExists) {
      console.log("User not found in view check");
      return false;
    }
    const recordExists = await verifyRecordExistence(recordID);
    if (!recordExists) {
      console.log("record not found in view check");
      return false;
    }
    const db = await connectDB();
    try {
        const [result] = await db.execute(
          "SELECT amount FROM debtrecords WHERE ID = ? AND userID = ?", 
          [recordID, userID]
        );
        console.log(result);
        if (result.length === 0) {
          console.log("User is not authorized to view record of other user or DNE");
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