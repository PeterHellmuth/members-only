/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const MessageSchema = new Schema({
  text: { type: String, required: true },
  user: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  timestamp_formatted: {
    type: String,
    default: "Sometime",
  },
});

// Virtual for book's URL
MessageSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/messages/${this._id}`;
});

MessageSchema.virtual("gettimestamp_formatted").get(function () {
  const DateTime = new Date(this.timestamp);
  return DateTime.toLocaleString(Date.DATETIME_MED);
});

// Export model
module.exports = mongoose.model("Message", MessageSchema);
