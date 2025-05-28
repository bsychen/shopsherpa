// constants to access the firestore
const admin = require("firebase-admin");
const serviceAccount = require("../key.json");

// intialise the admin sdk
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// fetch the records from the products collection
async function getProducts() {
    try {
        const productsSnapshot = await db.collection('products').get();
        const products = [];
        productsSnapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        console.log(products);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// call the function to fetch and log the products
getProducts();