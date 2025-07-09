const checkQr = require("../utils/qrscanner");
const generateAndAddQR = require("../utils/qrGenerator");

const path = require("path");
const uploadAndScanQr = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "please uplaod a file" });
  }
  const filepath = file.path;
  const filetype = file.mimetype;

  const qrdata = await checkQr(filepath, filetype);
  if (qrdata) {
    res.status(200).json({
      message: "QR code found!",
      qrdata: qrdata,
      file: file.filename,
    });
  } else {
    res.status(200).json({
      message: "No QR code found in the file.",
      file: file.filename,
    });
  }
};

const getQrCodeCollection = require("../models/qrModel");

const addQRToFile = async (req, res) => {
  const { filename, employeeId } = req.body;
  if (!filename || !employeeId) {
    return res
      .status(400)
      .json({ error: "Filename and employeeId are required" });
  }

  try {
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL;
    const verifyUrl = `${frontendBaseUrl}/verify/${employeeId}`;
    const finalFilename = await generateAndAddQR(filename, verifyUrl);

    // ✅ Save to qrcodes collection
    const qrCollection = await getQrCodeCollection();
    await qrCollection.insertOne({
      employeeId,
      documentName: finalFilename,
      verifyUrl,
      createdAt: new Date(),
    });

    return res.status(200).json({
      message: "✅ QR added and saved",
      file: finalFilename,
      fileUrl: `/uploads/${finalFilename}`,
      verifyUrl,
    });
  } catch (err) {
    console.error("❌ QR add failed", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { uploadAndScanQr, addQRToFile };
