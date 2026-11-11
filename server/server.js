<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { testConnection } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const priceRoutes = require('./routes/priceRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

/* ===================================================
   SECURITY & PARSING MIDDLEWARE
=================================================== */
// Helmet with relaxed cross-origin resource policy for uploaded product photos
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin === '*' ? true : [allowedOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ===================================================
   STATIC FILE SERVING
=================================================== */
// Static folder for uploaded product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ===================================================
   API ROUTES
=================================================== */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/suggest', suggestionRoutes);
app.use('/api/admin', adminRoutes);

// Root healthcheck endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'Farmer-to-Customer Marketplace REST API',
    database: 'MySQL',
    timestamp: new Date().toISOString()
  });
});

/* ===================================================
   ERROR HANDLING
=================================================== */
app.use(notFoundHandler);
app.use(errorHandler);

/* ===================================================
   START SERVER
=================================================== */
app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`  🌾 Farmer Marketplace Server running on port ${PORT}`);
  console.log(`  API Health: http://localhost:${PORT}/`);
  console.log(`==================================================`);
  await testConnection();
});

module.exports = app;
=======
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(express.json());

/* ======================
   USER SCHEMA
====================== */
const UserSchema = new mongoose.Schema({
  role: String,
  phone: String,
  email: String,
  password: String
});
const User = mongoose.model("User", UserSchema);

/* ======================
   PRODUCT SCHEMA
====================== */
const ProductSchema = new mongoose.Schema({
  name: String,
  price: String,
  farmerName: String,
  phone: String,
  address: String
});
const Product = mongoose.model("Product", ProductSchema);

/* ======================
   PRICE SCHEMA
====================== */
const PriceSchema = new mongoose.Schema({
  name: String,
  high: Number,
  good: Number,
  average: Number,
  low: Number
});
const Price = mongoose.model("Price", PriceSchema);

/* ======================
   DB CONNECTION
====================== */
mongoose.connect("mongodb://127.0.0.1:27017/agriculture")
  .then(async () => {
    console.log("MongoDB Connected");

    const count = await Price.countDocuments();
    if (count === 0) {
      await Price.insertMany([
        { name: "Rice", high: 2200, good: 2000, average: 1800, low: 1500 },
        { name: "Wheat", high: 2100, good: 1900, average: 1700, low: 1400 },
        { name: "Maize", high: 1800, good: 1600, average: 1400, low: 1200 },
        { name: "Cotton", high: 7000, good: 6500, average: 6000, low: 5500 }
      ]);
      console.log("Default prices inserted");
    }
  })
  .catch(err => console.log(err));

/* ======================
   REGISTER API
====================== */
app.post("/api/register", async (req, res) => {
  try {
    const { role, phone, email, password } = req.body;

    let existing;

    if (role === "farmer") {
      if (!phone || !password) {
        return res.json({ message: "Enter phone & password" });
      }
      existing = await User.findOne({ phone });
    } else {
      if (!email || !password) {
        return res.json({ message: "Enter email & password" });
      }
      existing = await User.findOne({ email });
    }

    if (existing) {
      return res.json({ message: "User already exists" });
    }

    const user = new User({ role, phone, email, password });
    await user.save();

    res.json({ message: "Registered successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Register error" });
  }
});

/* ======================
   LOGIN API
====================== */
app.post("/api/login", async (req, res) => {
  try {
    const { role, phone, email, password } = req.body;

    let user;

    if (role === "farmer") {
      user = await User.findOne({ phone });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.json({ message: "Wrong password" });
    }

    res.json({ message: "Login success", user });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login error" });
  }
});

/* ======================
   ADD PRODUCT
====================== */
app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ message: "Product added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error saving product" });
  }
});

/* ======================
   GET PRODUCTS
====================== */
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

/* ======================
   GET PRICES
====================== */
app.get("/api/prices", async (req, res) => {
  try {
    const prices = await Price.find();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching prices" });
  }
});

/* ======================
   CROP SUGGESTION API (FIXED)
====================== */
app.post("/api/suggest", (req, res) => {
  const { soil, season } = req.body;

  let crops = [];

  // soil-based crops
  if (soil === "black") {
    crops = ["Cotton", "Sugarcane"];
  }
  if (soil === "red") {
    crops = ["Groundnut", "Millets"];
  }
  if (soil === "sandy") {
    crops = ["Watermelon", "Peanuts"];
  }

  // season-based crops
  if (season === "summer") {
    crops.push("Maize");
  }
  if (season === "rainy") {
    crops.push("Rice");
  }
  if (season === "winter") {
    crops.push("Wheat");
  }

  res.json({ crops });
});

/* ======================
   ROOT TEST
====================== */
app.get("/", (req, res) => {
  res.send("Server Running 🚀");
});

/* ======================
   START SERVER
====================== */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
>>>>>>> 146d00b (first commit)
