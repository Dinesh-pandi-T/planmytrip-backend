const express = require("express");
const router = express.Router();
const {
    getBookings,
    getUserBookings,
    createBooking,
    updateBooking,
    deleteBooking
} = require("../Controllers/BookingController");

router.get("/", getBookings);
router.get("/user/:email", getUserBookings);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

module.exports = router;
