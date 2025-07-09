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
  let employeeId;

  try {
    const parsed = JSON.parse(req.body.employee || "{}");
    employeeId = parsed.employeeId;

    let files = [];

    if (req.file) files = [req.file];
    else if (req.files) files = req.files;

    if (!files.length || !employeeId) {
      return res
        .status(400)
        .json({ error: "Files and valid employeeId are required" });
    }

    const frontendBaseUrl = process.env.FRONTEND_BASE_URL;
    const verifyUrl = `${frontendBaseUrl}/verify/${employeeId}`;
    const qrCollection = await getQrCodeCollection();

    const processedFiles = [];

    for (const file of files) {
      const finalFilename = await generateAndAddQR(file.filename, verifyUrl);

      await qrCollection.insertOne({
        employeeId,
        documentName: finalFilename,
        verifyUrl,
        createdAt: new Date(),
      });

      processedFiles.push(finalFilename);
    }

    return res.status(200).json({
      message: "✅ QR(s) added and saved",
      files: processedFiles,
    });
  } catch (err) {
    console.error("❌ QR add failed", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};


module.exports = { uploadAndScanQr, addQRToFile };
