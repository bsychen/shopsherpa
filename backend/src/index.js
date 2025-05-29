// we need express to expose the API to the frontend
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("../key.json");
const app = express();
const PORT = 3001; //process.env.PORT ||

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL to allow CORS requests from
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));
// some JSON middleware he included in the tutorial
// parses JSON bodies and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// READ API endpoint
app.get("/api/products", async (req, res) => {
  try {
    // fetch the products collection from firestore
    const productsSnapshot = await db.collection("products").get();
    const products = [];
    // get the data fields from each product document
    productsSnapshot.forEach(doc => {
      products.push(doc.data());
    });
    // send the products as a JSON response
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// READ API endpoint for a specific product by name
app.get("/api/products/name/:name", async (req, res) => {
  try {
    const productsSnapshot = await db.collection("products")
      .where("ProductName", "==", req.params.name)
      .get();

    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        name: doc.data().ProductName,
        dbPrice: doc.data().ExpectedPrice
      });
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/**
 * Search API endpoint with which allows for search queries (with a partial match):
 * $ curl http://localhost:3000/api/products/search/?name=Ban
 * TODO: firebase filds are always case-sensitive, so we need to add a 'lowercase' field for this to work better
 */
app.get("/api/products/search", async (req, res) => {
  try {
    const { name } = req.query;
    const productsSnapshot = await db.collection("products")
      .where("ProductName", ">=", name)
      .where("ProductName", "<=", name + "\uf8ff")
      .get();

    const products = [];
      productsSnapshot.forEach(doc => {
        products.push({
          id: doc.id,
          name: doc.data().ProductName,
          dbPrice: doc.data().ExpectedPrice
        });
      });

      res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Can include endpoints for the rest of CRUD if needed

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
