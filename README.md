# ShopSherpa 

**ShopSherpa** is a comprehensive mobile-first web application designed to empower international students and immigrants in the UK to make informed grocery purchasing decisions. By combining real-time product data, community-driven reviews, and personalized recommendations, ShopSherpa transforms the shopping experience into an intelligent, confidence-building journey.

## Usage Guide

1. **Search Products**: Use the search bar or barcode scanner to find products

   <div align="center">
   <img src="public/readme/demo.gif" alt="Search Page" width="300">
   </div>

2. **View Insights**: Review radar charts, price comparisons, and community ratings

   ![Price Range Analysis](public/readme/price-range.png)

3. **Set Preferences**: Customize your shopping priorities in the profile section
   
   ![Profile Page](public/readme/profile-page.png)

4. **Manage Allergens**: Set up allergen warnings for safer shopping
   
   ![Allergen Warning System](public/readme/allergen-warning.png)

5. **Join Discussions**: Participate in community forums about products

    ![Community Discussions](public/readme/community.png)


### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for backend functionality
│   ├── auth/              # Authentication pages
│   ├── chats/             # Community forum
│   ├── product/[id]/      # Product detail pages
│   ├── profile/           # User profile management
│   ├── review/            # Review creation and viewing
│   └── search/            # Main search interface
├── components/            # Reusable React components
│   ├── buttons/           # Interactive button components
│   ├── cards/             # Product and content cards
│   ├── community/         # Forum and social features
│   ├── product/           # Product-specific components
│   ├── profile/           # User profile components
│   └── search/            # Search interface components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries and configurations
├── middleware/            # Authentication and request middleware
├── styles/                # Global styles and color schemes
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions and utilities
```

## Contributing

We welcome contributions to ShopSherpa! Please read our contributing guidelines and feel free to submit pull requests, report bugs, or suggest features. Here are some instructions on how to set up a local instance of the ShopSherpa App:

### Prerequisites
- Node.js 20+ and pnpm 9+

### Installation

1. **Clone the repository**
   ```bash
   git clone <-- put http or ssh repo url here -->
   cd shopsmart
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Firebase Setup**
- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable Firestore Database and Authentication
- Download service account credentials
- Configure authentication providers (Email/Password recommended)

4. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   # Firebase Configuration (Client)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   
   # Firebase Admin Configuration (Server)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your_client_id
   ```

5. **Database Initialization**
   ```bash
   # Seed initial tags for the community system
   node scripts/seedTags.js
   ```

6. **Start Development Server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000

## License

This project is licensed under the AGPLv3 License - see the [LICENSE.md](LICENSE.md) file for details.

---

**Built with ❤️ by the ShopSherpa Team — [Benjamin Cummings](https://github.com/BnjmnCummings), [Bruce Chen](https://github.com/bsychen), [Freddie Nunn](https://github.com/freddien03) and [Zachary Lazar](https://github.com/zakklzr)**
