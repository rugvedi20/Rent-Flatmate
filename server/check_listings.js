require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/Listing");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/rent-flatmate-finder";

async function check() {
  await mongoose.connect(MONGO_URI);
  const total = await Listing.countDocuments();
  const available = await Listing.countDocuments({ status: "available" });
  const filled = await Listing.countDocuments({ status: "filled" });
  console.log(`Total listings: ${total}`);
  console.log(`Available listings: ${available}`);
  console.log(`Filled listings: ${filled}`);
  
  if (total > 0) {
    const sample = await Listing.findOne();
    console.log("Sample Listing document:", JSON.stringify(sample, null, 2));
  }
  mongoose.connection.close();
}

check();
