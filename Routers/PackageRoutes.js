const express = require("express");
const router = express.Router();
const { getPackages, createPackage, deletePackage, updatePackage } = require("../Controllers/PackageController");

router.get("/", getPackages);
router.post("/", createPackage);
router.delete("/:id", deletePackage);
router.put("/:id", updatePackage);

module.exports = router;
