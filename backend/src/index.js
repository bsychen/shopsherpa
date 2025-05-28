// we need express to expose the API to the frontend
const express = require("express");
const admin = require("firebase-admin");
const serviceAccount = require("../key.json");

const app = express();
// in the youtube tutorial he uses this definition of PORT (for public deployment?)
const PORT = process.env.PORT || 3000;

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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

// Can include endpoints for the rest of CRUD if needed

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});