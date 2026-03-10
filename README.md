# Grocery Store Frontend

React.js frontend for the Grocery Store e-commerce platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── context/         # React Context for state management
│   ├── services/        # API calls and services
│   ├── utils/           # Helper functions
│   ├── App.js           # Main App component
│   └── index.js         # Entry point
├── public/              # Static files
└── package.json
```

## Pages

- **Home** - Landing page
- **Products** - Product listing with filters
- **Login** - User login
- **Register** - User registration
- **Cart** - Shopping cart
- **Orders** - Order history

## Components

- **Navbar** - Navigation bar with user menu
- **ProductListing** - Product grid with search and filters

## Context API

- **AuthContext** - User authentication state
- **CartContext** - Shopping cart state

## Services

- **api.js** - Axios instance with all API calls

## Features

✅ User Authentication
✅ Product Browsing
✅ Search and Filter
✅ Shopping Cart
✅ Order Management
✅ Responsive Design
✅ Context-based State Management

## Development

- Uses React Router v6 for navigation
- Axios for HTTP requests
- React Context API for state management
- CSS-in-JS with inline styles (can be replaced with CSS modules/Tailwind)

## Build and Deploy

```bash
# Build for production
npm run build

# The build folder is ready to be deployed
```

## Environment Setup

The frontend is configured to proxy API requests to `http://localhost:5000` during development.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm run eject` - Ejects from Create React App (irreversible)

**Note:** You don't need to eject unless you want to customize webpack configuration.
