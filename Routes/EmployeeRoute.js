const express = require("express");
const app = express();
const router = express.Router();
const upload = require("../utils/imageupload");
const {
  createEmployee,
  getAllEmployeesWithDocs,
} = require("../Controller/EmployeeController");
router.post("/form", upload.single("image"), createEmployee);
router.get("/employees", getAllEmployeesWithDocs);
module.exports = router;