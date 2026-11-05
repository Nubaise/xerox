const { createBooking } = require("../services/booking.service");

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

module.exports = { postBooking };