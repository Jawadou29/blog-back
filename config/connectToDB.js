const mongoose = require("mongoose");
require("dotenv").config()
async function connectToDB() {
  try {
    await mongoose.connect(process.env.MANGO_CLOUD_URI)
    console.log("connected to mangoDB")
  } catch (error) {
    console.log("connection failed to MangoDB", error)
  }
}

module.exports = connectToDB;