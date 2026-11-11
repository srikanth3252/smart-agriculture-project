const ProductModel = require('../models/productModel');

// GET /api/products
async function getProducts(req, res, next) {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
      farmerId,
      all
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    // By default, public marketplace only shows available products unless ?all=true
    const onlyAvailable = all === 'true' ? false : true;

    const [products, total] = await Promise.all([
      ProductModel.findFiltered({
        search,
        category,
        location,
        minPrice,
        maxPrice,
        sort,
        limit: limitNum,
        offset,
        farmerId,
        onlyAvailable
      }),
      ProductModel.countFiltered({
        search,
        category,
        location,
        minPrice,
        maxPrice,
        farmerId,
        onlyAvailable
      })
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/products/:id
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/products/farmer/my-products
async function getFarmerProducts(req, res, next) {
  try {
    const farmerId = req.user.id;
    const products = await ProductModel.findByFarmer(farmerId);

    res.json({
      success: true,
      products
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/products
async function createProduct(req, res, next) {
  try {
    const { name, category, description, price, quantity, unit, location } = req.body;

    if (!name || !category || !price || quantity === undefined || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required product fields: name, category, price, quantity, location.'
      });
    }

    const numPrice = parseFloat(price);
    const numQty = parseFloat(quantity);

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number.'
      });
    }

    if (isNaN(numQty) || numQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative number.'
      });
    }

    // Image URL if uploaded
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const productId = await ProductModel.create({
      farmer_id: req.user.id,
      name: name.trim(),
      category: category.trim(),
      description: description ? description.trim() : '',
      price: numPrice,
      quantity: numQty,
      unit: unit || 'kg',
      location: location.trim(),
      image_url: imageUrl,
      is_available: numQty > 0
    });

    const newProduct = await ProductModel.findById(productId);

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: newProduct
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/products/:id
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const farmerId = req.user.role === 'admin' ? null : req.user.id;

    // Check ownership
    const existing = await ProductModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (req.user.role !== 'admin' && existing.farmer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this product listing.'
      });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    }

    if (updateData.price !== undefined) {
      updateData.price = parseFloat(updateData.price);
    }

    if (updateData.quantity !== undefined) {
      updateData.quantity = parseFloat(updateData.quantity);
      if (updateData.quantity === 0) {
        updateData.is_available = false;
      }
    }

    if (updateData.is_available !== undefined) {
      updateData.is_available = updateData.is_available === true || updateData.is_available === 'true';
    }

    await ProductModel.update(id, farmerId, updateData);
    const updated = await ProductModel.findById(id);

    res.json({
      success: true,
      message: 'Product updated successfully!',
      product: updated
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const farmerId = req.user.role === 'admin' ? null : req.user.id;

    const existing = await ProductModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (req.user.role !== 'admin' && existing.farmer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this product listing.'
      });
    }

    await ProductModel.delete(id, farmerId);

    res.json({
      success: true,
      message: 'Product removed successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  getFarmerProducts,
  createProduct,
  updateProduct,
  deleteProduct
};

