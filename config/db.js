const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

//mongoose.connect(db)

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log("mongodb Connected");
  } catch (err) {
    console.log(err.message);

    //exit process with failure
    // process.exit(1);
  }
};

module.exports = connectDB;
