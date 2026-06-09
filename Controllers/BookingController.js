const Booking = require("../Models/BookingModel");
const mongoose = require("mongoose");

// Fallback in-memory bookings for robust server performance if MongoDB Atlas is down
let inMemoryBookings = [
  {
    id: "book-mem-1",
    userEmail: "explorer@example.com",
    userName: "Explorer User",
    packageId: "pkg-seed-3",
    title: "Santorini Sunset Odyssey",
    location: "Greece",
    date: "June 20, 2026",
    price: "$1,299",
    status: "Confirmed",
    travelerPhone: "+1 555-0199",
    numberOfTravelers: 2,
    travelerDetails: "Explorer User (25), Jane Doe (26)",
    pickupPoint: "Athens Airport Gate B",
    inchargeName: "Dimitris",
    inchargePhone: "+30 697 123 4567"
  },
  {
    id: "book-mem-2",
    userEmail: "explorer@example.com",
    userName: "Explorer User",
    packageId: "pkg-seed-2",
    title: "Alpine Swiss Valley Tour",
    location: "Switzerland",
    date: "July 14, 2026",
    price: "₹1,49,999",
    status: "Pending Approval",
    travelerPhone: "+1 555-0199",
    numberOfTravelers: 1,
    travelerDetails: "Explorer User (25)",
    pickupPoint: "",
    inchargeName: "",
    inchargePhone: ""
  }
];

// GET: Retrieve all bookings (Admin dashboard)
const getBookings = async (req, res) => {
    try {
        const isDbConnected = mongoose.connection.readyState === 1;
        if (isDbConnected) {
            let dbBookings = await Booking.find();
            // Map _id to id so frontend receives structure it expects
            const mapped = dbBookings.map(b => {
                const obj = b.toObject();
                return { ...obj, id: obj._id.toString() };
            });
            return res.status(200).json(mapped);
        } else {
            return res.status(200).json(inMemoryBookings);
        }
    } catch (err) {
        console.error("Failed to query bookings from DB:", err);
        return res.status(200).json(inMemoryBookings);
    }
};

// GET: Retrieve user-specific bookings
const getUserBookings = async (req, res) => {
    try {
        const { email } = req.params;
        const isDbConnected = mongoose.connection.readyState === 1;
        if (isDbConnected) {
            let dbBookings = await Booking.find({ userEmail: email });
            const mapped = dbBookings.map(b => {
                const obj = b.toObject();
                return { ...obj, id: obj._id.toString() };
            });
            return res.status(200).json(mapped);
        } else {
            const filtered = inMemoryBookings.filter(b => b.userEmail === email);
            return res.status(200).json(filtered);
        }
    } catch (err) {
        console.error("Failed to query user bookings from DB:", err);
        const filtered = inMemoryBookings.filter(b => b.userEmail === req.params.email);
        return res.status(200).json(filtered);
    }
};

// POST: Create a new booking
const createBooking = async (req, res) => {
    try {
        const {
            userEmail,
            userName,
            packageId,
            title,
            location,
            price,
            date,
            travelerPhone,
            numberOfTravelers,
            vegCount,
            nonVegCount,
            travelerDetails
        } = req.body;

        const bookingData = {
            userEmail,
            userName: userName || "Traveler",
            packageId: packageId || "pkg-default",
            title,
            location,
            price,
            date,
            status: "Pending Approval",
            travelerPhone,
            numberOfTravelers: Number(numberOfTravelers) || 1,
            vegCount: Number(vegCount) || 0,
            nonVegCount: Number(nonVegCount) || 0,
            travelerDetails,
            pickupPoint: "",
            inchargeName: "",
            inchargePhone: ""
        };

        const isDbConnected = mongoose.connection.readyState === 1;
        if (isDbConnected) {
            const newBooking = new Booking(bookingData);
            const saved = await newBooking.save();
            return res.status(201).json({
                message: "Booking recorded successfully in database",
                data: { ...saved.toObject(), id: saved._id.toString() }
            });
        } else {
            const newBooking = {
                id: "book-mem-" + Date.now(),
                ...bookingData
            };
            inMemoryBookings.push(newBooking);
            return res.status(201).json({
                message: "Booking recorded successfully (In-Memory Fallback)",
                data: newBooking
            });
        }
    } catch (err) {
        console.error("Failed to save booking:", err);
        return res.status(500).json({ message: "Failed to save booking", error: err.message });
    }
};

// PUT: Update booking status & admin travel logistics (pickup, tour guide details)
const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, pickupPoint, inchargeName, inchargePhone } = req.body;

        const isDbConnected = mongoose.connection.readyState === 1;
        if (isDbConnected) {
            const updated = await Booking.findByIdAndUpdate(
                id,
                { status, pickupPoint, inchargeName, inchargePhone },
                { new: true }
            );
            if (!updated) {
                // Try in-memory
                const idx = inMemoryBookings.findIndex(b => b.id === id);
                if (idx !== -1) {
                    inMemoryBookings[idx] = {
                        ...inMemoryBookings[idx],
                        status: status || inMemoryBookings[idx].status,
                        pickupPoint: pickupPoint !== undefined ? pickupPoint : inMemoryBookings[idx].pickupPoint,
                        inchargeName: inchargeName !== undefined ? inchargeName : inMemoryBookings[idx].inchargeName,
                        inchargePhone: inchargePhone !== undefined ? inchargePhone : inMemoryBookings[idx].inchargePhone
                    };
                    return res.status(200).json({ message: "Booking updated in in-memory store", data: inMemoryBookings[idx] });
                }
                return res.status(404).json({ message: "Booking not found" });
            }
            return res.status(200).json({
                message: "Booking updated successfully in database",
                data: { ...updated.toObject(), id: updated._id.toString() }
            });
        } else {
            const idx = inMemoryBookings.findIndex(b => b.id === id);
            if (idx === -1) {
                return res.status(404).json({ message: "Booking not found in memory fallback" });
            }
            inMemoryBookings[idx] = {
                ...inMemoryBookings[idx],
                status: status || inMemoryBookings[idx].status,
                pickupPoint: pickupPoint !== undefined ? pickupPoint : inMemoryBookings[idx].pickupPoint,
                inchargeName: inchargeName !== undefined ? inchargeName : inMemoryBookings[idx].inchargeName,
                inchargePhone: inchargePhone !== undefined ? inchargePhone : inMemoryBookings[idx].inchargePhone
            };
            return res.status(200).json({ message: "Booking updated in in-memory store", data: inMemoryBookings[idx] });
        }
    } catch (err) {
        console.error("Failed to update booking:", err);
        return res.status(500).json({ message: "Failed to update booking", error: err.message });
    }
};

// DELETE: Cancel/delete booking
const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const isDbConnected = mongoose.connection.readyState === 1;
        if (isDbConnected) {
            const deleted = await Booking.findByIdAndDelete(id);
            if (!deleted) {
                // Try in-memory
                const idx = inMemoryBookings.findIndex(b => b.id === id);
                if (idx !== -1) {
                    const removed = inMemoryBookings.splice(idx, 1)[0];
                    return res.status(200).json({ message: "Booking cancelled from memory", data: removed });
                }
                return res.status(404).json({ message: "Booking not found" });
            }
            return res.status(200).json({ message: "Booking cancelled from DB", data: deleted });
        } else {
            const idx = inMemoryBookings.findIndex(b => b.id === id);
            if (idx === -1) {
                return res.status(404).json({ message: "Booking not found in memory" });
            }
            const removed = inMemoryBookings.splice(idx, 1)[0];
            return res.status(200).json({ message: "Booking cancelled from memory fallback", data: removed });
        }
    } catch (err) {
        console.error("Failed to cancel booking:", err);
        return res.status(500).json({ message: "Failed to cancel booking", error: err.message });
    }
};

module.exports = {
    getBookings,
    getUserBookings,
    createBooking,
    updateBooking,
    deleteBooking
};
