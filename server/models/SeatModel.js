const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const seatModel = new Schema({
  seatNumber: { type: Number, unique: true },
  booked: { type: Boolean, default: false },
  bookedBy: { type: String, default: "Unbooked" },
});

const SeatModel = mongoose.model("Seats", seatModel);

module.exports = SeatModel;
