const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    duration: { type: String, required: true },
    image: { type: String, default: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" },
    hotel: { type: String, default: "3 Star Hotel" },
    activities: { type: Number, default: 4 },
    meals: { type: String, default: "Breakfast + Dinner" },
    transport: { type: String, default: "Airport Pickup" },
    highlights: { type: String, default: "City Sightseeing, Guided Tour" },
    price: { type: String, required: true },
    tag: { type: String, default: "Featured" },
    rawPrice: { type: Number, default: 10000 },
    rating: { type: Number, default: 4.8 },
    reviews: { type: Number, default: 42 }
}, { timestamps: true });

module.exports = mongoose.model("Package", PackageSchema);
