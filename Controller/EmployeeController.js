const getEmployeeCollection = require("../models/employeeModel");
const getQrCodeCollection = require("../models/qrModel");
// Auto-generate EMP ID like EMP0001
async function generateEmployeeId(collection) {
  const total = await collection.countDocuments();
  return `EMP${(total + 1).toString().padStart(4, "0")}`;
}

exports.createEmployee = async (req, res) => {
  try {
    const employeeCollection = await getEmployeeCollection();

    const employeeId = await generateEmployeeId(employeeCollection);

    const { Name, Department, Designation, date_of_joining, issuedby } =
      req.body;

    const imagePath = req.file ? req.file.path : "";

    const employee = {
      employeeId,
      name: Name,
      department: Department,
      designation: Designation,
      dateOfJoining: new Date(date_of_joining),
      issuedBy: issuedby || "HR Manager",
      issuedDate: new Date(),
      image: imagePath,
    };

    const result = await employeeCollection.insertOne(employee);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employeeId: employee.employeeId, // ✅ this line is missing
    });
  } catch (error) {
    console.error("❌ Error creating employee:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getAllEmployeesWithDocs = async (req, res) => {
  try {
    const empCollection = await getEmployeeCollection();
    const qrCollection = await getQrCodeCollection();

    // Get all employees
    const employees = await empCollection.find({}).toArray();

    // For each employee, fetch their QR documents
    const enrichedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const docs = await qrCollection
          .find({ employeeId: emp.employeeId })
          .project({ documentName: 1, _id: 0 })
          .toArray();

        return {
          ...emp,
          documents: docs.map((d) => d.documentName),
        };
      })
    );

    res.status(200).json(enrichedEmployees);
  } catch (err) {
    console.error("❌ Failed to fetch employees with QR files:", err);
    res.status(500).json({ error: "Server error" });
  }
};
