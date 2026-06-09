const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    packageId: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, default: "Pending Approval", enum: ["Pending Approval", "Confirmed", "Cancelled"] },
    travelerPhone: { type: String, required: true },
    numberOfTravelers: { type: Number, required: true, default: 1 },
    vegCount: { type: Number, default: 0 },
    nonVegCount: { type: Number, default: 0 },
    travelerDetails: { type: String, required: true },
    pickupPoint: { type: String, default: "" },
    inchargeName: { type: String, default: "" },
    inchargePhone: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);
