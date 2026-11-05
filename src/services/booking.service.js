
const crypto = require("crypto");

const printers = require("../data/printers");
const bookings = require("../data/bookings");

// Convert HH:mm into minutes from midnight
const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

// Validate date
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

// Validate booking request
const validateBooking = (data) => {
    const {
        rollNumber,
        printerId,
        date,
        startTime,
        pages,
        copies,
        printType,
        sides,
        binding
    } = data;

    if (!rollNumber || typeof rollNumber !== "string" || !rollNumber.trim()) {
        throw new Error("Valid student roll number is required");
    }

    if (!printerId || !printers.some(p => p.id === printerId)) {
        throw new Error("Invalid printer ID");
    }

    if (!isValidDate(date)) {
        throw new Error("Invalid date. Use YYYY-MM-DD");
    }

    if (
        typeof startTime !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)
    ) {
        throw new Error("Invalid start time. Use HH:mm");
    }

    if (!Number.isInteger(pages) || pages <= 0) {
        throw new Error("Pages must be a positive integer");
    }

    if (!Number.isInteger(copies) || copies <= 0) {
        throw new Error("Copies must be a positive integer");
    }

    if (!["BW", "COLOR"].includes(printType)) {
        throw new Error("Print type must be BW or COLOR");
    }

    if (!["SINGLE", "DOUBLE"].includes(sides)) {
        throw new Error("Sides must be SINGLE or DOUBLE");
    }

    if (typeof binding !== "boolean") {
        throw new Error("Binding must be true or false");
    }

    if (printType === "COLOR" && sides === "DOUBLE") {
        throw new Error("Colour printing supports single-sided printing only");
    }

    const printer = printers.find(p => p.id === printerId);

    if (printer.type !== printType) {
        throw new Error(`${printerId} does not support ${printType} printing`);
    }

    return printer;
};

// Calculate total price
const calculatePrice = (data) => {
    const ratePerPage = data.printType === "BW" ? 1 : 8;

    const printingCost = data.pages * data.copies * ratePerPage;
    const bindingCost = data.binding ? data.copies * 30 : 0;

    return printingCost + bindingCost;
};

// Calculate printing duration
const calculateDuration = (data, printer) => {
    const totalPages = data.pages * data.copies;
    const printingMinutes = Math.ceil(totalPages / printer.speed);
    const handlingMinutes = 2;

    return printingMinutes + handlingMinutes;
};

// Check whether two time intervals overlap
const hasOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && end1 > start2;
};

// Check printer availability
const checkAvailability = (printer, date, startTime, duration) => {
    const requestedStart = toMinutes(startTime);
    const requestedEnd = requestedStart + duration;

    // Check existing bookings
    const existingBookings = bookings.filter(booking =>
        booking.printerId === printer.id &&
        booking.date === date
    );

    for (const booking of existingBookings) {
        const existingStart = toMinutes(booking.startTime);
        const existingEnd = toMinutes(booking.endTime);

        if (
            hasOverlap(
                requestedStart,
                requestedEnd,
                existingStart,
                existingEnd
            )
        ) {
            throw new Error("Printer already has a booking during this time");
        }
    }

    // Check protected daily buffer slots
    for (const slot of printer.bufferSlots || []) {
        const bufferStart = toMinutes(slot.startTime);
        const bufferEnd = toMinutes(slot.endTime);

        if (
            hasOverlap(
                requestedStart,
                requestedEnd,
                bufferStart,
                bufferEnd
            )
        ) {
            throw new Error(
                "This time slot is reserved for printer failure recovery"
            );
        }
    }
};

// Main booking function
const createBooking = (data) => {
    const printer = validateBooking(data);

    const duration = calculateDuration(data, printer);

    const startMinutes = toMinutes(data.startTime);
    const endMinutes = startMinutes + duration;

    if (endMinutes >= 24 * 60) {
        throw new Error("Booking cannot extend beyond midnight");
    }

    const endHours = Math.floor(endMinutes / 60);
    const endRemainder = endMinutes % 60;

    const endTime =
        String(endHours).padStart(2, "0") +
        ":" +
        String(endRemainder).padStart(2, "0");

    // Pass duration in minutes, NOT the formatted endTime
    checkAvailability(
        printer,
        data.date,
        data.startTime,
        duration
    );

    const price = calculatePrice(data);

    const booking = {
        bookingId: crypto.randomUUID(),
        rollNumber: data.rollNumber.trim(),
        printerId: data.printerId,
        date: data.date,
        startTime: data.startTime,
        endTime,
        pages: data.pages,
        copies: data.copies,
        printType: data.printType,
        sides: data.sides,
        binding: data.binding,
        duration,
        price,
        status: "CONFIRMED"
    };

    bookings.push(booking);

    return booking;
};

module.exports = {
    createBooking
};
