const fs = require("fs");
const Jimp = require("jimp");
const QrCode = require("qrcode-reader");
const { exec } = require("child_process");
const path = require("path");

//image Qr check
const checkQRInImage = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const image = await Jimp.read(buffer);

  const qr = new QrCode();
  return new Promise((resolve) => {
    qr.callback = (err, value) => {
      if (err || !value) return resolve(null);
      resolve(value.result);
    };
    qr.decode(image.bitmap); // scan kara ga image ko pixel by pixel
  });
};

//pdf to image conversion
const convertPDFToImage = (pdfPath) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(pdfPath); // e.g. "uploads/"
    const base = path.basename(pdfPath, ".pdf"); // e.g. "file"
    const outputPath = path.join(dir, base + "_page1"); // e.g. "uploads/file_page1"
    const cmd = `pdftocairo -jpeg -singlefile -f 1 -l 1 "${pdfPath}" "${outputPath}"`;

    exec(cmd, (error) => {
      if (error) {
        console.error("❌ PDF to image conversion failed:", error);
        return reject(error);
      }
      resolve(outputPath + ".jpg"); // e.g. "uploads/file_page1.jpg"
    });
  });
};
//Docx to pdf conversion
const convertDOCXToPDF = (docxPath) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(docxPath);
    const isWindows = process.platform === "win32";

    // Use correct LibreOffice path
    const sofficeCmd = isWindows
      ? `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`
      : "soffice"; // on Linux (Docker/Railway)

    const cmd = `${sofficeCmd} --headless --convert-to pdf "${docxPath}" --outdir "${dir}"`;

    exec(cmd, (error) => {
      if (error) {
        console.error("❌ DOCX to PDF conversion failed:", error);
        return reject(error);
      }

      const baseName = path.basename(docxPath, ".docx").trim();
      const pdfPath = path.join(dir, `${baseName}.pdf`);
      resolve(pdfPath);
    });
  });
};


const checkQR = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if ([".png", ".jpg", ".jpeg"].includes(ext)) {
      return await checkQRInImage(filePath);
    }

    if (ext === ".pdf") {
      const imagePath = await convertPDFToImage(filePath);
      const qrData = await checkQRInImage(imagePath);
      fs.unlinkSync(imagePath); //  cleanup
      return qrData;
    }

    if (ext === ".docx") {
      const pdfPath = await convertDOCXToPDF(filePath);
      const imagePath = await convertPDFToImage(pdfPath);
      const qrData = await checkQRInImage(imagePath);
      fs.unlinkSync(imagePath);
      fs.unlinkSync(pdfPath); // cleanup
      return qrData;
    }

    console.log("❌ Unsupported file type:", ext);
    return null;
  } catch (error) {
    console.error("❌ QR scanning failed:", error);
    return null;
  }
};

module.exports = checkQR;
 
