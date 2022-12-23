const express = require(`express`);
const mongoose = require("mongoose");
const semaphore = require("semaphore")(1);
const Seat = require("./models/SeatModel");
require("dotenv").config();
const app = express();

app.use(express.json());

const mongoDB = process.env.DATABASE_URL;

mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

const seatBooking = (req, res) => {
  semaphore.take(async () => {
    try {
      const requiredSeats = req.body.seats;
      const name = req.body.name;
      Array.prototype.forEach.call(requiredSeats, (seat) => Number(seat));
      const occupied = [];
      const tobeBooked = [];
      await Promise.all(
        requiredSeats.map(async (seat) => {
          const currentSeat = await Seat.findOne({ seatNumber: seat });
          if (currentSeat.booked === true) {
            occupied.push(currentSeat.seatNumber);
          } else if (occupied.length === 0) {
            tobeBooked.push(currentSeat);
          }
        })
      );
      console.log(occupied);
      if (occupied.length)
        res.status(403).json({
          message: "Request Denied as the following seats are already booked",
          seats: occupied,
        });
      else {
        await Promise.all(
          tobeBooked.map(async (seat) => {
            seat.booked = true;
            seat.bookedBy = name;
            await seat.save();
          })
        );
        res.status(200).json({
          message: "The Seats are successfully booked, The booked seats are - ",
          seats: requiredSeats,
        });
      }
    } catch (error) {
      console.error(error.message);
      res.send(error.message);
    }
    semaphore.leave();
  });
};
const getAvailableSeats = async (req, res) => {
  try {
    const seats = await Seat.find({ booked: "false" });
    const availableseats = seats.map((seat) => seat.seatNumber);
    res.status(200).json({ availableseats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
app.post("/populate", async (req, res) => {
  const seats = [];
  for (var i = 1; i <= 500; i++) {
    var seat = new Seat({
      seatNumber: i,
    });
    seat = await seat.save();
    seats.push(seat);
  }
  res.status(201).json({
    seats,
  });
});
app.get("/all", async (req, res) => {
  const seats = await Seat.find({});
  res.status(200).json(seats);
});

app.get("/available", getAvailableSeats);
app.post("/bookSeat", seatBooking);
app.listen(8080, () => console.log(`server running at port 8080`));
