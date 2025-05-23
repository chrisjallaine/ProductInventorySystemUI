const Product = require('../models/Product');

// Create a new product entry with required fields
exports.createProduct = async (req, res) => {
  try {
    // Destructure the required fields from the request body
    const { name, category_id, supplier_id, price, description } = req.body;

    // Basic validation: all fields must be present
    if (!name || !category_id || !supplier_id || !price || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create and save the product document in MongoDB
    const product = await Product.create({ name, category_id, supplier_id, price, description });
    
    // Respond with the created product and 201 Created status
    res.status(201).json(product);
  } catch (error) {
    // Catch unexpected errors and respond with 500 Internal Server Error
    res.status(500).json({ error: error.message });
  }
};

// Retrieve all products with their associated category and supplier details
exports.getAllProducts = async (req, res) => {
  try {
    // Find all products and populate the 'category_id' and 'supplier_id' references
    const products = await Product.find().populate('category_id supplier_id');
    
    // Return the list of products with 200 OK status
    res.status(200).json(products);
  } catch (error) {
    // Handle errors with 500 Internal Server Error
    res.status(500).json({ error: error.message });
  }
};

// Retrieve a single product by its ID, including category and supplier info
exports.getProductById = async (req, res) => {
  try {
    // Find product by MongoDB ObjectId and populate references
    const product = await Product.findById(req.params.id)
      .populate('category_id')
      .populate('supplier_id');

    // If product not found, respond with 404 Not Found
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Return the found product
    res.json(product);
  } catch (err) {
    // Catch errors such as invalid ID format and respond with 500
    res.status(500).json({ message: err.message });
  }
};

// Search products by name with case-insensitive partial matching
exports.getProductByName = async (req, res) => {
  try {
    // Normalize input name query to lowercase and trim spaces
    const nameQuery = req.params.name.trim().toLowerCase();

    // Use regex for case-insensitive partial matching in MongoDB
    const products = await Product.find({
      name: { $regex: nameQuery, $options: 'i' }
    });

    // If no matching products found, respond with 404
    if (products.length === 0) return res.status(404).json({ message: 'Product not found' });

    // Map products to a simplified response format (selected fields only)
    const result = products.map(product => ({
      name: product.name,
      description: product.description,
      price: product.price
    }));

    // Return all matched products with 200 OK
    res.status(200).json(result);
  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({ error: error.message });
  }
};

// Update product details by ID with new data in the request body
exports.updateProduct = async (req, res) => {
  try {
    // Find product by ID and update with req.body, returning the new document
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // If product not found, respond with 404
    if (!updated) return res.status(404).json({ message: "Product not found" });
    
    // Return the updated product document
    res.status(200).json(updated);
  } catch (error) {
    // Handle errors such as invalid ID or update failure
    res.status(500).json({ error: error.message });
  }
};

// Delete a product by its ID
exports.deleteProduct = async (req, res) => {
  try {
    // Find product by ID and delete it
    const deleted = await Product.findByIdAndDelete(req.params.id);

    // If product not found, respond with 404
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    // Confirm deletion success
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    // Handle deletion errors
    res.status(500).json({ error: error.message });
  }
};
