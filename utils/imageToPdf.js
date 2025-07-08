const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

const imageToPDF = async (imagePath, outputPath) => {
  const pdfDoc = await PDFDocument.create();
  const imageBytes = fs.readFileSync(imagePath);

  const img = imagePath.endsWith(".png")
    ? await pdfDoc.embedPng(imageBytes)
    : await pdfDoc.embedJpg(imageBytes);

  const page = pdfDoc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
};

module.exports = imageToPDF;
