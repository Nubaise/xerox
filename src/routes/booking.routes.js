
const express = require("express");
const router = express.Router();

const {
    postBooking,
    getStudentBookings
} = require("../controllers/booking.controller");

// Create booking
router.post("/", postBooking);

// Get bookings by student roll number
router.get("/student/:rollNumber", getStudentBookings);

module.exports = router;
