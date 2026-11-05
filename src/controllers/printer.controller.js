const printers = require("../data/printers");
const bookings = require("../data/bookings");

// Validate YYYY-MM-DD date format and actual calendar date
const isValidDate = (date) => {
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const [year, month, day] = date.split("-").map(Number);

    const parsed = new Date(Date.UTC(year, month - 1, day));

    return (
        parsed.getUTCFullYear() === year &&
        parsed.getUTCMonth() === month - 1 &&
        parsed.getUTCDate() === day
    );
};

// GET /printers?date=YYYY-MM-DD
const getPrinters = (req, res) => {
    const { date } = req.query;

    // Validate date
    if (!isValidDate(date)) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing date. Use YYYY-MM-DD."
        });
    }

    // Attach bookings belonging to the requested date
    const result = printers.map(printer => ({
        ...printer,
        bookings: bookings.filter(booking =>
            booking.printerId === printer.id &&
            booking.date === date
        )
    }));

    return res.status(200).json({
        success: true,
        date,
        printers: result
    });
};

module.exports = {
    getPrinters
};
