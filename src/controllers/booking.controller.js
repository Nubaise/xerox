
const bookings = require("../data/bookings");
const { createBooking } = require("../services/booking.service");

// Create booking
const postBooking = (req, res) => {
    try {
        const booking = createBooking(req.body);

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all bookings for a student
const getStudentBookings = (req, res) => {
    const { rollNumber } = req.params;

    if (!rollNumber || !rollNumber.trim()) {
        return res.status(400).json({
            success: false,
            message: "Student roll number is required"
        });
    }

    const studentBookings = bookings.filter(
        booking => booking.rollNumber === rollNumber.trim()
    );

    return res.status(200).json({
        success: true,
        rollNumber: rollNumber.trim(),
        totalBookings: studentBookings.length,
        bookings: studentBookings
    });
};

module.exports = {
    postBooking,
    getStudentBookings
};
