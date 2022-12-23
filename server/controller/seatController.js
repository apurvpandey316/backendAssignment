const semaphore = require("semaphore")(1);
const Seat = require("../models/SeatModel");

//function for booking available seats
const seatBooking = (req, res) => {
  // semaphore is used here to achieve data synchronization
  // it only gives access to change data to only one request at a time
  semaphore.take(async () => {
    try {
      const requiredSeats = req.body.seats;
      const name = req.body.name;
      Array.prototype.forEach.call(requiredSeats, (seat) => Number(seat));

      //occupied will contain seats which are already booked
      const occupied = [];

      //tobeBooked has all the seats which the users wants to booked
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

      //occupied.length > 0, no seats will be booked
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

//getting the seats available for booking
const getAvailableSeats = async (req, res) => {
  try {
    const seats = await Seat.find({ booked: "false" });
    const availableseats = seats.map((seat) => seat.seatNumber);
    res.status(200).json({ availableseats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//inserting 500 seats in the database which can be booked
const populateDatabase = async (req, res) => {
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
};

//tells about each seat, booked or unbooked, name of the person booking
const statusAll = async (req, res) => {
  const seats = await Seat.find({});
  res.status(200).json(seats);
};
module.exports = {
  getAvailableSeats,
  seatBooking,
  populateDatabase,
  statusAll,
};
