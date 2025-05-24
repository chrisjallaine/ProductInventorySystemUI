const Supplier = require('../models/Supplier'); 
const Product = require('../models/Product');   
const Inventory = require('../models/Inventory');

// Create Supplier
exports.createSupplier = async (req, res) => {
  try {
    const isArray = Array.isArray(req.body);

    if (isArray && req.body.length === 0) {
      return res.status(400).json({ message: "Empty array is not allowed" });
    }

    let result;

    if (isArray) {
      // For batch insert, skip duplicate logic; rely on database-level uniqueness if needed
      result = await Supplier.insertMany(req.body, { ordered: false });
    } else {
      // Check for full document match before inserting
      const exists = await Supplier.findOne(req.body);
      if (exists) {
        return res.status(409).json({
          message: "Supplier already exists with identical fields.",
          existing: exists
        });
      }

      result = await Supplier.create(req.body);
    }

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to create supplier(s)", error: err.message });
  }
};


// Get All Suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find(); // Fetch all suppliers from DB
    res.status(200).json(suppliers); // Respond with all suppliers, status 200 OK
  } catch (error) {
    // Handle and return internal errors
    res.status(500).json({ message: "Failed to fetch suppliers", error: error.message });
  }
};

// Get Supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id); // Find supplier by MongoDB ObjectId
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' }); // Return 404 if not found
    }
    res.status(200).json(supplier); // Return the found supplier
  } catch (error) {
    // Return error if find operation fails
    res.status(500).json({ message: "Failed to fetch supplier", error: error.message });
  }
};

// Get Supplier by Name
exports.getSupplierByName = async (req, res) => {
  try {
    const name = req.params.name; // Extract name parameter from URL
    const suppliers = await Supplier.find({
      name: { $regex: new RegExp(name, "i") } // Case-insensitive partial match
    });

    if (!suppliers.length) {
      return res.status(404).json({ message: 'No suppliers found with that name' }); // If none matched, return 404
    }

    res.status(200).json(suppliers); // Return matched suppliers
  } catch (error) {
    res.status(500).json({ message: "Failed to search suppliers", error: error.message }); // Return error
  }
};

// Update Supplier
exports.updateSupplier = async (req, res) => {
  try {
    // Find supplier by ID and update with request body, return updated document
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Supplier not found' }); // Return 404 if not found
    }

    res.status(200).json(updated); // Return updated supplier
  } catch (error) {
    res.status(500).json({ message: "Failed to update supplier", error: error.message }); // Return server error
  }
};

// Delete Supplier (with referential integrity check)
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params; // Extract supplier ID from request parameters

    // Find all products that reference this supplier
    const referencingProducts = await Product.find({ supplier_id: id });

    // If any product references the supplier, block deletion and return 409 Conflict
    if (referencingProducts.length > 0) {
      return res.status(409).json({
        message: `Cannot delete supplier. It is still referenced by ${referencingProducts.length} product(s).`, // Message to explain conflict
        referencingCount: referencingProducts.length // Include count of references
      });
    }

    // No references found, proceed to delete the supplier
    const deleted = await Supplier.findByIdAndDelete(id); // Delete supplier by ID

    // If no supplier is found, return 404 Not Found
    if (!deleted) {
      return res.status(404).json({ message: 'Supplier not found' }); // Send error if supplier doesn't exist
    }

    // Successful deletion
    res.status(200).json({ message: 'Supplier deleted successfully' }); // Return success message
  } catch (error) {
    // Catch and return any server-side error
    res.status(500).json({ message: "Failed to delete supplier", error: error.message }); // Fallback for unexpected errors
  }
};

// Get all suppliers of products matching a given name
exports.getSuppliersByProduct = async (req, res) => {
  try {
    const value = req.params.value.trim(); // Get product name from URL param and trim spaces

    const matchedProducts = await Product.find({
      name: { $regex: new RegExp(value, "i") } // Case-insensitive search by product name
    });

    if (!matchedProducts.length) {
      return res.status(404).json({ message: "No products matched the given name." }); // If no products found
    }

    const productIds = matchedProducts.map(p => p._id); // Extract product IDs from matched results

    // Find suppliers based on products listed in their delivery logs
    const suppliers = await Supplier.find({ 'deliveryLogs.product_id': { $in: productIds } });

    if (!suppliers.length) {
      return res.status(404).json({ message: "No suppliers found for the matched product(s)." }); // No suppliers linked
    }

    res.status(200).json(suppliers); // Return matched suppliers
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch suppliers by product", error: err.message }); // Return server error
  }
};

// Get all suppliers supplying to a specific warehouse
exports.getSuppliersByWarehouse = async (req, res) => {
  try {
    const inventory = await Inventory.find({ warehouse_id: req.params.warehouseId }); // Find inventory records for the given warehouse ID

    if (!inventory.length) {
      return res.status(404).json({ message: "No inventory found for this warehouse." }); // Return 404 if no inventory exists
    }

    const productIds = inventory.map(item => item.product_id); // Get list of product IDs from inventory
    const products = await Product.find({ _id: { $in: productIds } }); // Fetch those products

    // Extract unique supplier IDs from those products (filter out nulls)
    const supplierIds = [...new Set(products.map(p => p.supplier_id?.toString()).filter(Boolean))];

    if (!supplierIds.length) {
      return res.status(404).json({ message: "No suppliers found for this warehouse." }); // No supplier links found
    }

    const suppliers = await Supplier.find({ _id: { $in: supplierIds } }); // Find suppliers by unique IDs

    res.status(200).json(suppliers); // Return list of suppliers
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch suppliers by warehouse", error: err.message }); // Return server error
  }
};
