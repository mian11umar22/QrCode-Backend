  const fs = require("fs");
  const path = require("path");
  const { exec } = require("child_process");
  const Jimp = require("jimp");
  const QRCode = require("qrcode");
  const imageToPDF = require("./imageToPdf");

  // ✅ Generate QR from a given URL
  const generateQR = async (outputPath, url) => {
    return new Promise((resolve, reject) => {
      QRCode.toFile(outputPath, url, { width: 300 }, (err) =>
        err ? reject(err) : resolve(outputPath)
      );
    });
  };

  // ✅ Convert PDF to JPG
  const convertPDFToImage = (pdfPath) => {
    return new Promise((resolve, reject) => {
      const output = path.join(
        path.dirname(pdfPath),
        path.basename(pdfPath, ".pdf") + "_page1"
      );
      const cmd = `pdftocairo -jpeg -singlefile -f 1 -l 1 "${pdfPath}" "${output}"`;
      exec(cmd, (err) => (err ? reject(err) : resolve(output + ".jpg")));
    });
  };

  // ✅ Convert DOCX to PDF using LibreOffice
  const path = require("path");
  const { exec } = require("child_process");

  const convertDOCXToPDF = (docxPath) => {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(docxPath);
      const cmd = `soffice --headless --convert-to pdf "${docxPath}" --outdir "${dir}"`;

      exec(cmd, (err) => {
        if (err) {
          console.error("❌ DOCX to PDF conversion failed:", err);
          return reject(err);
        }

        const pdfPath = path.join(
          dir,
          path.basename(docxPath, ".docx") + ".pdf"
        );
        resolve(pdfPath);
      });
    });
  };
  

  // ✅ Composite QR onto image
  const addQRToImage = async (imagePath, qrPath, outputName) => {
    const [image, qr] = await Promise.all([
      Jimp.read(imagePath),
      Jimp.read(qrPath),
    ]);
    qr.resize(100, 100); // size of QR code
    image.composite(qr, image.bitmap.width - 110, image.bitmap.height - 110);
    const outputPath = path.join(path.dirname(imagePath), outputName);
    await image.writeAsync(outputPath);
    return outputPath;
  };

  // ✅ Main function: takes filename + verifyUrl and returns updated file name
  const generateAndAddQR = async (filename, verifyUrl) => {
    const uploadsDir = path.join(__dirname, "../uploads");
    const filePath = path.join(uploadsDir, filename);
    const ext = path.extname(filename).toLowerCase();

    // 1. Generate QR code image
    const qrPath = path.join(uploadsDir, `qr-${Date.now()}.png`);
    await generateQR(qrPath, verifyUrl);

    let finalOutput = "";

    // 2. Add QR to image files
    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      finalOutput = await addQRToImage(filePath, qrPath, `qr-${filename}`);

      // 3. Add QR to PDF (convert → add → re-PDF)
    } else if (ext === ".pdf") {
      const imagePath = await convertPDFToImage(filePath);
      const updatedImage = await addQRToImage(
        imagePath,
        qrPath,
        `qr-img-${Date.now()}.jpg`
      );
      const finalPdf = path.join(uploadsDir, `qr-${Date.now()}.pdf`);
      await imageToPDF(updatedImage, finalPdf);
      fs.unlinkSync(imagePath);
      finalOutput = finalPdf;

      // 4. Add QR to DOCX (convert to PDF first)
    } else if (ext === ".docx") {
      const pdf = await convertDOCXToPDF(filePath);
      const imagePath = await convertPDFToImage(pdf);
      const updatedImage = await addQRToImage(
        imagePath,
        qrPath,
        `qr-img-${Date.now()}.jpg`
      );
      const finalPdf = path.join(uploadsDir, `qr-${Date.now()}.pdf`);
      await imageToPDF(updatedImage, finalPdf);
      fs.unlinkSync(pdf);
      fs.unlinkSync(imagePath);
      finalOutput = finalPdf;
    } else {
      throw new Error("Unsupported file type");
    }

    // 5. Clean up QR temp file
    fs.unlinkSync(qrPath);

    return path.basename(finalOutput); // just the file name
  };

  module.exports = generateAndAddQR;
