const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    requried: true
  }
})

const model = mongoose.model("schema", schema )

module.exports = model;
