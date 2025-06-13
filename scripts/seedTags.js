// Script to seed initial tags in Firestore
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value;
    }
  });
}

// Initialize Firebase Admin (if not already initialized)
if (!getApps().length) {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
  };

  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

const initialTags = [
  // Food Type Tags
  { name: 'Organic', category: 'food-type', usageCount: 0 },
  { name: 'Vegan', category: 'food-type', usageCount: 0 },
  { name: 'Gluten-Free', category: 'food-type', usageCount: 0 },
  { name: 'Dairy-Free', category: 'food-type', usageCount: 0 },
  { name: 'Keto', category: 'food-type', usageCount: 0 },
  { name: 'Paleo', category: 'food-type', usageCount: 0 },
  { name: 'Raw', category: 'food-type', usageCount: 0 },
  { name: 'Sugar-Free', category: 'food-type', usageCount: 0 },

  // Country Tags
  { name: 'UK', category: 'country', usageCount: 0 },
  { name: 'Italy', category: 'country', usageCount: 0 },
  { name: 'France', category: 'country', usageCount: 0 },
  { name: 'Spain', category: 'country', usageCount: 0 },
  { name: 'Germany', category: 'country', usageCount: 0 },
  { name: 'USA', category: 'country', usageCount: 0 },
  { name: 'Japan', category: 'country', usageCount: 0 },
  { name: 'India', category: 'country', usageCount: 0 },
  { name: 'Mexico', category: 'country', usageCount: 0 },
  { name: 'Greece', category: 'country', usageCount: 0 },

  // Diet Tags
  { name: 'Vegetarian', category: 'diet', usageCount: 0 },
  { name: 'Pescatarian', category: 'diet', usageCount: 0 },
  { name: 'Mediterranean', category: 'diet', usageCount: 0 },
  { name: 'Low-Carb', category: 'diet', usageCount: 0 },
  { name: 'High-Protein', category: 'diet', usageCount: 0 },
  { name: 'Whole30', category: 'diet', usageCount: 0 },

  // Other Tags
  { name: 'Budget-Friendly', category: 'other', usageCount: 0 },
  { name: 'Premium', category: 'other', usageCount: 0 },
  { name: 'Local', category: 'other', usageCount: 0 },
  { name: 'Imported', category: 'other', usageCount: 0 },
  { name: 'Seasonal', category: 'other', usageCount: 0 },
  { name: 'Artisan', category: 'other', usageCount: 0 },
  { name: 'Mass-Market', category: 'other', usageCount: 0 },
];

async function seedTags() {
  try {
    console.log('Starting to seed tags...');
    
    for (const tag of initialTags) {
      await db.collection('tags').add(tag);
      console.log(`Added tag: ${tag.name} (${tag.category})`);
    }
    
    console.log(`Successfully seeded ${initialTags.length} tags!`);
  } catch (error) {
    console.error('Error seeding tags:', error);
  }
}

// Run the seeding function
seedTags().then(() => {
  console.log('Seeding completed');
  process.exit(0);
}).catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
