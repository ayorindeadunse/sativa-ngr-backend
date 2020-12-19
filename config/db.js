const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

// connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
    });

    //log using logging dependency...
    console.log("MongoDB Connected.");
  } catch (error) {
    //log
    console.error(error.message);
    //exit process
    process.exit(1);
  }
};

module.exports = connectDB;
