const express = require(`express`);
const mongoose = require("mongoose");
const {
  getAvailableSeats,
  seatBooking,
  populateDatabase,
  statusAll,
} = require("./controller/seatController");
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

app.post("/populate", populateDatabase);
app.get("/all", statusAll);

app.get("/available", getAvailableSeats);
app.post("/bookSeat", seatBooking);
app.listen(8080, () => console.log(`server running at port 8080`));
