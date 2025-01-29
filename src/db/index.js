import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log(
      `\n Monogo DB connected: DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("monogoDbconnection Error", error);
    process.exit(1);
    //Exits the Node.js process with a status code of 1, indicating that an error occurred.
  }
};

export default connectDB;

/*
const connectionInstance = await mongoose.connect(...): Uses the mongoose.connect method to 
connect to the MongoDB database.The connection string is constructed using the 
MONGODB_URI environment variable and the DB_NAME constant.
${process.env.MONGODB_URI}/${DB_NAME}: This is the connection string.
process.env.MONGODB_URI is an environment variable that contains the base URI 
for the MongoDB server, and DB_NAME is the name of the database.

*/
