const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.listen(5000,()=>{
    console.log("Server is running on port 5000");
});

const userroutes = require("./Routers/UserRoutes");
const packageroutes = require("./Routers/PackageRoutes");
const bookingroutes = require("./Routers/BookingRoutes");
app.use("/api/user",userroutes);
app.use("/api/packages",packageroutes);
app.use("/api/bookings",bookingroutes);

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000 // Timeout fast if IP is not whitelisted
    });
    console.log("Mongo Db Connected successfully to Atlas Cluster");
  } catch (err) {
    console.warn("Mongo Db Atlas Connection Failed:", err.message);
    console.log("Attempting fallback to local MongoDB...");
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/trip-planning", {
        serverSelectionTimeoutMS: 3000
      });
      console.log("Mongo Db Connected successfully to Local MongoDB (Fallback)");
    } catch (localErr) {
      console.error("All MongoDB connection attempts failed:", localErr.message);
    }
  }
};

connectDB();