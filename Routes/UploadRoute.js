const express = require("express");
const app = express();
const router = express.Router();
const upload = require("../Middleware/multer");
const {
  uploadAndScanQr,
  addQRToFile,
} = require("../Controller/QRcodeController");
router.post("/upload", upload.single("file"), uploadAndScanQr);
router.post("/addqr", addQRToFile);
module.exports = router;
