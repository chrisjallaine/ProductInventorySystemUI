const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path"); // ⬅️ Needed for serving HTML files
const connectDB = require("./config/database");

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const inventoryRoutes = require('./routes/inventoryRoutes');
//const inventoryHistoryRoutes = require('./routes/inventoryHistoryRoutes');
const supplierRoutes = require("./routes/supplierRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// 📁 Serve static frontend files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// 🛣️ Route Mounting
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use('/api/inventory', inventoryRoutes);
//app.use('/api/inventory/history', inventoryHistoryRoutes);
app.use("/api/suppliers", supplierRoutes);

// 404 + Error Handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


