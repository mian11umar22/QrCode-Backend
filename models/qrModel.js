const connectToDb = require("../Config/db");

async function getQrCodeCollection() {
  const db = await connectToDb();
  return db.collection("qrcodes");
}

module.exports = getQrCodeCollection;
