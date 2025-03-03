// models/Chat.js
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  useremail: { type: String, required: true },  
  receiveremail: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chat", chatSchema);