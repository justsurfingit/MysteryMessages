import mongoose from "mongoose";
type ConnectionObject = {
  isConnected?: number;
};
const ur = process.env.MONGO_URI;
const connection: ConnectionObject = {};
async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }
  try {
    const db = await mongoose.connect(ur || "");
    connection.isConnected = db.connections[0].readyState;
    // so okay connection is done and dusted that's cool let's proceed then and we are good to go
    console.log("Connection Established Succesfully");
  } catch (err) {
    console.log("Connection FAILED", err);
    process.exit(1);
  }
}

export default dbConnect;
