const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const port = process.env.PORT || 3000;
app.use(cors());
const uploadRoute = require("./Routes/UploadRoute");
const formRoute = require("./Routes/EmployeeRoute");
const verifyroute =require("./Routes/verifyRoute");
app.use(express.json());
app.use("/api", uploadRoute);
app.use("/api", formRoute);
app.use("/api", verifyroute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => {
  console.log(`The Server is Running on the port ${port}`);
});
