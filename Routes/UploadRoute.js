const express = require("express");
const app = express();
const router = express.Router();
const upload = require("../Middleware/multer");
const {
  uploadAndScanQr,
  addQRToFile,
} = require("../Controller/QRcodeController");

router.post("/upload", upload.any(), uploadAndScanQr);
router.post("/addqr", upload.any(), addQRToFile); // ✅ Fixed here

module.exports = router;
