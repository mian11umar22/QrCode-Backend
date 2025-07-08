const connectToDb = require("../Config/db");

async function getEmployeeCollection() {
  const db = await connectToDb();
  return db.collection("employees");
}

module.exports = getEmployeeCollection;
