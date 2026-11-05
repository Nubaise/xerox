const express = require("express");
const router = express.Router();

const { postBooking } = require("../controllers/booking.controller");

router.post("/", postBooking);

module.exports = router;