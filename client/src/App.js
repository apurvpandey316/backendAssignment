import axios from "axios";
import React, { useState } from "react";
import "./App.css";

function App() {
  const [availableSeats, setAvailableSeats] = useState([]);
  const [fetchSeats, setFetchSeats] = useState(false);
  const [name, setName] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);

  const getAvailableSeats = async () => {
    const availableSeats = await axios.get("/available");
    setAvailableSeats(availableSeats.data.availableseats);
    if (availableSeats.length === 0)
      return alert("Sorry!, No seats available now");
    setFetchSeats(true);
  };
  const toggleSeat = (e) => {
    if (e.target.style.backgroundColor === "lightblue") {
      const toggleIndex = Number(e.target.innerHTML);
      setSelectedSeats((prev) => [...prev, toggleIndex]);
      e.target.style.backgroundColor = "lightgreen";
    } else {
      const toggleIndex = Number(e.target.innerHTML);
      setSelectedSeats((prev) => prev.filter((seat) => seat !== toggleIndex));
      e.target.style.backgroundColor = "lightblue";
    }
  };
  const bookSeats = async () => {
    try {
      if (name === "") return alert("Name must be entered");
      if (selectedSeats.length === 0) return alert("0 seats selected");
      const res = await axios.post("/bookSeat", {
        name,
        seats: selectedSeats,
      });
      alert(`${res.data.message} ${res.data.seats}`);
    } catch (error) {
      if (error.response && error.response.status == 403) {
        alert(`${error.response.data.message} ${error.response.data.seats}`);
      } else alert(`${error.message}, Try again`);
    }
    setAvailableSeats([]);
    setSelectedSeats([]);
    setName("");
  };
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "skyblue",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <button
        onClick={getAvailableSeats}
        style={{
          height: "3rem",
          margin: "2rem",
          padding: "1rem",
          width: "30vw",
          cursor: "pointer",
          fontWeight: "600",
          borderRadius: "1rem",
          border: "none",
          fontSize: "1rem",
          backgroundColor: "#5F8D4E",
        }}
      >
        Get available seats
      </button>
      {availableSeats.length > 0 && (
        <>
          <div
            style={{
              display: "grid",
              gap: "0.175rem",
              margin: "1rem",
              width: "80vw",
              gridTemplateColumns: "repeat(25,1fr)",
            }}
          >
            {availableSeats.map((seat) => (
              <button
                key={seat}
                onClick={toggleSeat}
                style={{
                  background: "lightblue",
                  textAlign: "center",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {seat}
              </button>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flex: "row",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <input
              type="text"
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
              style={{
                height: "1rem",
                padding: "0.5rem",
                background: "lightgray",
                border: "none",
                borderRadius: "0.25rem",
              }}
            />
            <button
              onClick={bookSeats}
              style={{
                height: "3rem",
                margin: "2rem",
                padding: "1rem",
                width: "30vw",
                cursor: "pointer",
                fontWeight: "600",
                borderRadius: "1rem",
                border: "none",
                fontSize: "1rem",
                backgroundColor: "#5F8D4E",
              }}
            >
              BookSeats
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
