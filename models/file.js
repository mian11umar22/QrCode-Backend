// models/File.js
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true,
  },
  hasQR: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", fileSchema);
