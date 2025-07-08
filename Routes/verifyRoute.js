const express = require("express");
const router = express.Router();
const getEmployeeCollection = require("../models/employeeModel");

router.get("/verify/:employeeId", async (req, res) => {
  try {
    const collection = await getEmployeeCollection();
    const employee = await collection.findOne({
      employeeId: req.params.employeeId,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ success: true, employee });
  } catch (err) {
    console.error("❌ Error in verify route:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
