import {connectDB} from "./db.js"
import bcrypt from "bcrypt";

async function createUser(name, password) {
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
async function verifyUsername(name) {
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

async function verifyUserLogin(email, password) {
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

  async function getUserName(id) {
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

  async function getTotalDebt(id) {
    const db = await connectDB();
    try {
      const [rows] = await db.execute(
        "SELECT SUM(amount) as totalamount FROM debtrecords WHERE userID = ? AND ispaid = 0",
        [id]
      );
      console.log(rows[0]);
      return rows[0];
    } catch (err) {
      console.error("Error verifying user:", err);
    } finally {
      await db.end();
    }
  }

  async function getDebts(id) {
    const db = await connectDB();
    try {
      const [rows] = await db.execute(
        "SELECT ID, amount, note, ispaid FROM debtrecords WHERE userID = ?",
        [id]
      );
      return rows;
    } catch (err) {
      console.error("Error verifying user:", err);
    } finally {
      await db.end();
    }
  }
  async function verifyUserExistence(id) {
    const db = await connectDB();
    try {
      const [rows] = await db.execute(
        "SELECT username FROM users WHERE ID = ?",
        [id]
      );
  
      if (rows.length === 0) {
        console.log("User not found in verifyUserExistence");
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

  async function insertRecord(value, note, userID) {
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
        throw new Error("Database insert failed: " + err.message);
      } finally {
        await db.end();
      }
  }

  async function verifyRecordExistence(id) {
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
      console.error("Error verifying record:", err);
    } finally {
      await db.end();
    }
  }

  async function checkIfUserCanViewRecord(recordID, userID) {
    const recordExists = await verifyRecordExistence(recordID);
    if (!recordExists) {
      console.log("record not found in view check");
      return false;
    }
    const db = await connectDB();
    try {
        const [result] = await db.execute(
          "SELECT amount, note FROM debtrecords WHERE ID = ? AND userID = ?", 
          [recordID, userID]
        );
        if (result.length === 0) {
          console.log("User is not authorized to view record of other user or DNE");
          return false;
        } else {
          console.log(result);
          return result;
        }
      } catch (err) {
        console.error("Error updating record:", err);
      } finally {
        await db.end();
      }
  }

  async function updateRecord(value, note, userID, recordID) {
    const recordExists = await verifyRecordExistence(recordID);
    if (!recordExists) {
      console.log("Record not found in update record");
      return false;
    }
    const db = await connectDB();
    try {
        const [result] = await db.execute(
          "UPDATE debtrecords SET amount = ?, note = ? WHERE userID = ? AND ID = ?", 
          [value, note, userID, recordID]
        );
        return true;
      } catch (err) {
        console.error("Error adding user:", err);
        throw new Error("Database update failed: " + err.message);
      } finally {
        await db.end();
      }
  }

  async function deleteRecord(recordID, userID) {
    const recordExists = await verifyRecordExistence(recordID);
    if (!recordExists) {
      console.log("Record not found in delete record");
      return false;
    }
    const canView = checkIfUserCanViewRecord(recordID, userID);
    if (!canView) {
      console.log("Not authorized or record doesn't exist");
      return false;
    }
    const db = await connectDB();
    try {
        const [result] = await db.execute(
          "DELETE FROM debtrecords WHERE ID = ? AND userID = ?", 
          [recordID, userID]
        );
        return true;
      } catch (err) {
        console.error("Error adding user:", err);
      } finally {
        await db.end();
      }
  }
  async function pay(recordID, userID) {
    const recordExists = await verifyRecordExistence(recordID);
    if (!recordExists) {
      console.log("Record not found in delete record");
      return false;
    }
    const canView = await checkIfUserCanViewRecord(recordID, userID);
    if (!canView) {
      console.log("Not authorized or record doesn't exist");
      return false;
    }
    const db = await connectDB();
    try {
        const [result] = await db.execute(
          "UPDATE debtrecords SET ispaid = 1 WHERE ID = ? AND userID = ? AND ispaid = 0", 
          [recordID, userID]
        );
        return result.affectedRows > 0;
      } catch (err) {
        console.error("Error adding user:", err);
      } finally {
        await db.end();
      }
  }

  export { createUser, verifyUsername, verifyUserLogin, getUserName, getDebts, insertRecord, checkIfUserCanViewRecord, updateRecord, deleteRecord, verifyUserExistence, getTotalDebt, pay };