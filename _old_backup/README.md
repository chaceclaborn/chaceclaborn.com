# Chace Claborn - Portfolio Website

A modern, professional portfolio website built with Vite, React, Tailwind CSS, and Firebase authentication.

## Features

- **Modern Tech Stack**: Vite + React + Tailwind CSS for fast development and beautiful UI
- **Firebase Authentication**: Secure user authentication with tiered access levels
- **Responsive Design**: Fully responsive across all devices
- **Professional Layout**: Clean, portfolio-focused design
- **Fast Performance**: Optimized build with Vite
- **Type-Safe**: ESM modules with modern JavaScript

## Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/) 5.4.x
- **Frontend Framework**: [React](https://react.dev/) 19.x
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.x
- **Authentication**: [Firebase](https://firebase.google.com/) 10.x
- **Package Manager**: [Yarn](https://yarnpkg.com/) 1.22.x
- **Deployment**: AWS S3

## Project Structure

```
chace-claborn-portfolio/
├── src/
│   ├── index.html              # Home page
│   ├── main.js                 # Application entry point
│   │
│   ├── pages/                  # Additional pages
│   │   ├── portfolio.html
│   │   ├── resume.html
│   │   ├── family.html         # Protected: Family tier
│   │   ├── girlfriend.html     # Protected: Girlfriend tier
│   │   └── admin.html          # Protected: Admin tier
│   │
│   ├── components/             # React components
│   │   ├── auth/              # Authentication components
│   │   ├── carousels/         # Image & quote carousels
│   │   ├── family/            # Family dashboard
│   │   └── navigation/        # Navigation component
│   │
│   ├── services/              # Business logic
│   │   └── firebase/          # Firebase services
│   │       ├── config.js
│   │       ├── auth-service.js
│   │       ├── auth-tiers.js
│   │       ├── database.service.js
│   │       └── terms-manager.js
│   │
│   ├── config/                # Configuration
│   │   └── environment.js
│   │
│   ├── utils/                 # Utilities
│   │   └── logger.js
│   │
│   └── styles/                # Stylesheets
│       └── main.css           # Tailwind + custom styles
│
├── public/                    # Static assets
│   └── files/                # Downloadable files
│
├── archive/                   # Archived components
│   └── (chatbot, widgets, etc.)
│
├── tests/                     # Test files
│
├── dist/                      # Build output (gitignored)
│
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── package.json               # Dependencies & scripts
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Yarn** 1.22+ (Install: `npm install -g yarn`)
- **Firebase Account** (for authentication features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chaceclaborn/chaceclaborn.com.git
   cd chaceclaborn.com
   ```

2. **Install dependencies**
   ```bash
   yarn
   ```

3. **Set up environment variables**

   Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   # ... etc
   ```

4. **Start development server**
   ```bash
   yarn dev
   ```

   The site will automatically open at `http://localhost:3000`

## Available Scripts

- `yarn dev` - Start development server with auto-reload
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run tests
- `yarn test:ui` - Run tests with UI
- `yarn lint` - Lint code
- `yarn lint:fix` - Lint and auto-fix issues
- `yarn format` - Format code with Prettier
- `yarn deploy` - Build and deploy to AWS S3
- `yarn check` - Run tests, lint, and build

## Development

### Running Locally

```bash
yarn dev
```

Your browser will automatically open to `http://localhost:3000`. The page will hot-reload when you make changes.

### Building for Production

```bash
yarn build
```

This creates an optimized production build in the `dist/` directory.

### Testing the Production Build

```bash
yarn build
yarn preview
```

## Access Tiers

The website implements Firebase-based tiered access:

- **Public**: Home, Portfolio, Resume (accessible to everyone)
- **Family**: Family dashboard (requires family tier access)
- **Girlfriend**: Personal tab (requires girlfriend tier access)
- **Admin**: Admin panel (requires admin access)

Access tiers are managed through Firebase authentication and custom user claims.

## Deployment

### AWS S3 Deployment

The site is deployed to AWS S3 with CloudFront CDN.

```bash
yarn deploy
```

This will:
1. Build the production bundle
2. Sync the `dist/` folder to S3
3. Invalidate CloudFront cache (if configured)

### Prerequisites for Deployment

- AWS CLI installed and configured
- S3 bucket created (`chaceclaborn.com`)
- CloudFront distribution (optional, for CDN)

## Styling with Tailwind CSS

This project uses Tailwind CSS v4 with a custom design system matching the original green theme.

### Custom Colors

```css
--primary-green: #617140
--dark-green: #4a5930
--sage-green: #c5ceb3
--pale-green: #e6ead4
```

### Using Tailwind Classes

```html
<div class="card">
  <h1 class="text-4xl font-bold text-primary-green">Hello</h1>
  <button class="btn-modern">Click Me</button>
</div>
```

## Firebase Configuration

### Setting Up Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password, Google, etc.)
3. Create a Firestore database
4. Add your credentials to `.env.local`

### User Tiers

User access tiers are stored in Firestore:

```javascript
// Firestore collection: users/{uid}
{
  email: "user@example.com",
  tier: "family", // or "girlfriend", "admin"
  displayName: "User Name"
}
```

## Contributing

This is a personal portfolio website, but suggestions and bug reports are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Chace Claborn**
- Website: [chaceclaborn.com](https://chaceclaborn.com)
- LinkedIn: [linkedin.com/in/chace-claborn-3b4b1017b/](https://www.linkedin.com/in/chace-claborn-3b4b1017b/)
- GitHub: [github.com/chaceclaborn](https://github.com/chaceclaborn)
- Email: chaceclaborn@gmail.com

---

Built with ❤️ using Vite, React, and Tailwind CSS
