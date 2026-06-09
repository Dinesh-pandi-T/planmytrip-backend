const Package = require("../Models/PackageModel");
const mongoose = require("mongoose");

// Default seed packages to populate the database if it is empty
const defaultPackages = [
  {
    title: 'Goa Beach Tour',
    location: 'Goa, India',
    duration: '5N/6D',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    hotel: '3 Star Hotel',
    activities: 5,
    meals: 'Breakfast + Dinner',
    transport: 'Airport Pickup',
    highlights: 'Beach Photoshoot, Scuba Diving, Sunset Cruise',
    price: '₹12,999',
    tag: 'Best Seller',
    rawPrice: 12999,
    rating: 4.8,
    reviews: 128
  },
  {
    title: 'Alpine Swiss Valley Tour',
    location: 'Switzerland',
    duration: '7N/8D',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    hotel: '5 Star Resort',
    activities: 6,
    meals: 'All Meals',
    transport: 'First Class Train Pass',
    highlights: 'Zermatt Hiking, Glacier Express, Cable Car Tour',
    price: '₹1,49,999',
    tag: 'Eco-Luxury',
    rawPrice: 149999,
    rating: 4.95,
    reviews: 95
  },
  {
    title: 'Santorini Sunset Odyssey',
    location: 'Greece',
    duration: '6 Days / 5 Nights',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80',
    hotel: '4 Star Hotel',
    activities: 4,
    meals: 'Breakfast',
    transport: 'Airport Shuttle',
    highlights: 'Oia Sunset Walk, Volcano Cruise, Wine Tasting',
    price: '$1,299',
    tag: 'Best Seller',
    rawPrice: 109000,
    rating: 4.9,
    reviews: 142
  },
  {
    title: 'Kyoto Heritage Trails',
    location: 'Japan',
    duration: '5 Days / 4 Nights',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    hotel: 'Traditional Ryokan',
    activities: 5,
    meals: 'Breakfast + Dinner',
    transport: 'Bullet Train Ticket',
    highlights: 'Fushimi Inari Shrine, Bamboo Forest Walk, Tea Ceremony',
    price: '$1,420',
    tag: 'Cultural',
    rawPrice: 119000,
    rating: 4.95,
    reviews: 210
  }
];

// Initialize server-side in-memory packages with default list
let inMemoryPackages = defaultPackages.map((pkg, index) => ({
    id: `pkg-mem-default-${index}`,
    ...pkg
}));

// GET: Retrieve all packages (seeds defaults if empty)
const getPackages = async (req, res) => {
    try {
        const isDbConnected = mongoose.connection.readyState === 1;

        if (isDbConnected) {
            let packages = await Package.find();
            if (packages.length === 0) {
                console.log("No packages found in DB. Seeding default packages...");
                await Package.insertMany(defaultPackages);
                packages = await Package.find();
            }
            
            // Map _id to id so frontend client receives structure it expects
            const mappedPackages = packages.map(pkg => {
                const obj = pkg.toObject();
                return {
                    ...obj,
                    id: obj._id.toString()
                };
            });
            
            return res.status(200).json(mappedPackages);
        } else {
            console.log("MongoDB is not connected. Serving packages from in-memory fallback store.");
            return res.status(200).json(inMemoryPackages);
        }
    } catch (error) {
        console.error("Mongoose DB query failed:", error);
        // Fail-safe: if Mongoose throws an error (e.g. timeout), fall back to in-memory
        console.log("Serving packages from in-memory fallback store after query error.");
        return res.status(200).json(inMemoryPackages);
    }
};

// POST: Create a new package
const createPackage = async (req, res) => {
    try {
        const { 
            title, 
            location, 
            duration, 
            image, 
            hotel, 
            activities, 
            meals, 
            transport, 
            highlights, 
            price, 
            tag, 
            rawPrice 
        } = req.body;

        // Process fields to format price and convert rawPrice
        let formattedPrice = price;
        if (price && !price.toString().startsWith('₹') && !price.toString().startsWith('$')) {
            formattedPrice = '₹' + Number(price).toLocaleString('en-IN');
        }

        let computedRawPrice = rawPrice;
        if (!computedRawPrice && price) {
            computedRawPrice = parseInt(price.toString().replace(/[^0-9]/g, '')) || 0;
        }

        // Randomize rating and reviews count for rich look if not provided
        const rating = (4.5 + Math.random() * 0.5).toFixed(2);
        const reviews = Math.floor(20 + Math.random() * 200);

        const packageData = {
            title,
            location,
            duration,
            image: image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            hotel: hotel || "3 Star Hotel",
            activities: activities ? parseInt(activities) : 4,
            meals: meals || "Breakfast + Dinner",
            transport: transport || "Airport Pickup",
            highlights: highlights || "City Sightseeing, Guided Tour",
            price: formattedPrice,
            tag: tag || "Featured",
            rawPrice: computedRawPrice,
            rating: parseFloat(rating),
            reviews: reviews
        };

        const isDbConnected = mongoose.connection.readyState === 1;

        if (isDbConnected) {
            const newPkg = new Package(packageData);
            const savedPkg = await newPkg.save();
            
            return res.status(201).json({
                message: "Package created successfully in MongoDB",
                data: {
                    ...savedPkg.toObject(),
                    id: savedPkg._id.toString()
                }
            });
        } else {
            console.log("MongoDB is not connected. Storing package in in-memory fallback store.");
            const newPkg = {
                id: 'pkg-mem-' + Date.now(),
                ...packageData
            };
            inMemoryPackages.unshift(newPkg); // Add to the top of in-memory list
            return res.status(201).json({
                message: "Package created successfully (In-Memory Fallback)",
                data: newPkg
            });
        }
    } catch (error) {
        console.error("Mongoose DB save failed:", error);
        // Fail-safe: if Mongoose fails, write to in-memory store
        console.log("Storing package in in-memory fallback store after save error.");
        const newPkg = {
            id: 'pkg-mem-' + Date.now(),
            title: req.body.title,
            location: req.body.location,
            duration: req.body.duration,
            image: req.body.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            hotel: req.body.hotel || "3 Star Hotel",
            activities: req.body.activities ? parseInt(req.body.activities) : 4,
            meals: req.body.meals || "Breakfast + Dinner",
            transport: req.body.transport || "Airport Pickup",
            highlights: req.body.highlights || "City Sightseeing, Guided Tour",
            price: req.body.price,
            tag: req.body.tag || "Featured",
            rawPrice: req.body.rawPrice || 10000,
            rating: 4.8,
            reviews: 42
        };
        inMemoryPackages.unshift(newPkg);
        return res.status(201).json({
            message: "Package created successfully (In-Memory Fallback)",
            data: newPkg
        });
    }
};

// DELETE: Remove a package
const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const isDbConnected = mongoose.connection.readyState === 1;

        if (isDbConnected) {
            const deletedPkg = await Package.findByIdAndDelete(id);
            if (!deletedPkg) {
                // If it wasn't found in DB, try in-memory just in case
                const index = inMemoryPackages.findIndex(p => p.id === id);
                if (index !== -1) {
                    const deleted = inMemoryPackages.splice(index, 1)[0];
                    return res.status(200).json({
                        message: "Package deleted successfully from in-memory fallback",
                        data: deleted
                    });
                }
                return res.status(404).json({ message: "Package not found" });
            }
            return res.status(200).json({
                message: "Package deleted successfully from MongoDB",
                data: deletedPkg
            });
        } else {
            console.log("MongoDB is not connected. Deleting package from in-memory fallback store.");
            const index = inMemoryPackages.findIndex(p => p.id === id);
            if (index === -1) {
                return res.status(404).json({ message: "Package not found" });
            }
            const deleted = inMemoryPackages.splice(index, 1)[0];
            return res.status(200).json({
                message: "Package deleted successfully (In-Memory Fallback)",
                data: deleted
            });
        }
    } catch (error) {
        console.error("Mongoose DB delete failed:", error);
        // Fail-safe: if Mongoose fails, try to delete from in-memory store
        console.log("Deleting package from in-memory fallback store after delete error.");
        const index = inMemoryPackages.findIndex(p => p.id === req.params.id);
        if (index !== -1) {
            const deleted = inMemoryPackages.splice(index, 1)[0];
            return res.status(200).json({
                message: "Package deleted successfully (In-Memory Fallback)",
                data: deleted
            });
        }
        return res.status(400).json({
            message: "Failed to delete package",
            error: error.message
        });
    }
};

// PUT: Update an existing package
const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            location, 
            duration, 
            image, 
            hotel, 
            activities, 
            meals, 
            transport, 
            highlights, 
            price, 
            tag, 
            rawPrice 
        } = req.body;

        // Process fields to format price and convert rawPrice
        let formattedPrice = price;
        if (price && !price.toString().startsWith('₹') && !price.toString().startsWith('$')) {
            formattedPrice = '₹' + Number(price).toLocaleString('en-IN');
        }

        let computedRawPrice = rawPrice;
        if (!computedRawPrice && price) {
            computedRawPrice = parseInt(price.toString().replace(/[^0-9]/g, '')) || 0;
        }

        const packageData = {
            title,
            location,
            duration,
            image,
            hotel,
            activities: activities ? parseInt(activities) : 4,
            meals,
            transport,
            highlights,
            price: formattedPrice,
            tag,
            rawPrice: computedRawPrice
        };

        const isDbConnected = mongoose.connection.readyState === 1;

        if (isDbConnected) {
            const updatedPkg = await Package.findByIdAndUpdate(id, packageData, { new: true });
            if (!updatedPkg) {
                // If not found in DB, try in-memory
                const index = inMemoryPackages.findIndex(p => p.id === id);
                if (index !== -1) {
                    inMemoryPackages[index] = { ...inMemoryPackages[index], ...packageData };
                    return res.status(200).json({
                        message: "Package updated successfully in in-memory fallback",
                        data: inMemoryPackages[index]
                    });
                }
                return res.status(404).json({ message: "Package not found" });
            }
            return res.status(200).json({
                message: "Package updated successfully in MongoDB",
                data: {
                    ...updatedPkg.toObject(),
                    id: updatedPkg._id.toString()
                }
            });
        } else {
            console.log("MongoDB is not connected. Updating package in in-memory fallback store.");
            const index = inMemoryPackages.findIndex(p => p.id === id);
            if (index === -1) {
                return res.status(404).json({ message: "Package not found" });
            }
            inMemoryPackages[index] = { ...inMemoryPackages[index], ...packageData };
            return res.status(200).json({
                message: "Package updated successfully (In-Memory Fallback)",
                data: inMemoryPackages[index]
            });
        }
    } catch (error) {
        console.error("Mongoose DB update failed:", error);
        // Fail-safe fallback: update in-memory
        const index = inMemoryPackages.findIndex(p => p.id === req.params.id);
        if (index !== -1) {
            inMemoryPackages[index] = { ...inMemoryPackages[index], ...req.body };
            return res.status(200).json({
                message: "Package updated successfully (In-Memory Fallback)",
                data: inMemoryPackages[index]
            });
        }
        return res.status(400).json({
            message: "Failed to update package",
            error: error.message
        });
    }
};

module.exports = {
    getPackages,
    createPackage,
    deletePackage,
    updatePackage
};
