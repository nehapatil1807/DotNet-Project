# DotNet-Project
# Elegant Jewellery E-Commerce Platform

## Overview
Elegant Jewellery is a full-stack e-commerce platform designed to provide a seamless and personalized shopping experience for luxury jewelry products. The platform includes an intuitive frontend and a robust backend, equipped with modern technologies to ensure scalability, security, and user satisfaction.

---

## Features

### Frontend
- **Dynamic Navbar** with role-based access (Admin/User).
- **Product Management** with a carousel for showcasing featured products.
- **Cart Functionality**: Add, update, or remove products from the cart.
- **Order Management**: View order history and track orders.
- **Dark Mode**: Toggle between light and dark themes.
- **Responsive Design** using Bootstrap and CSS.

### Backend
- **JWT Authentication**: Secure login and registration system.
- **Role-based Access**: Separate features for Admin and Users.
- **Cart and Order Services**: Manage carts, process orders, and update order statuses.
- **API Documentation**: Auto-generated Swagger documentation.
- **Database Integration**: MySQL for relational data management.

---

## Technology Stack

### Frontend
- **Framework**: React with Vite for a fast development experience.
- **State Management**: React Context API.
- **Styling**: Bootstrap and custom CSS.
- **API Communication**: Axios for REST API integration.

### Backend
- **Framework**: .NET Core MVC.
- **Database**: MySQL.
- **Authentication**: JWT (JSON Web Tokens).
- **Data Access**: Repository Pattern with Entity Framework Core.
- **Documentation**: Swagger/OpenAPI.

---

## Folder Structure

### Frontend
```
Front-End/
├── public/                # Static assets
├── src/                   # Source code
│   ├── components/        # Reusable React components
│   ├── context/           # Context providers for global state
│   ├── services/          # API integration modules
│   ├── styles/            # CSS files
│   └── utils/             # Utility functions
├── index.html             # Application entry point
└── vite.config.js         # Vite configuration
```

### Backend
```
Back-End/
├── Controllers/           # API Controllers
├── Data/                  # Database context and migrations
├── DTOs/                  # Data Transfer Objects
├── Entities/              # Models representing database tables
├── Helpers/               # Utility classes (e.g., JWT settings)
├── Repositories/          # Data access layer
├── Services/              # Business logic
├── appsettings.json       # Configuration file
└── Program.cs             # Application entry point
```

---

## Installation and Setup

### Prerequisites
- Node.js and npm (for frontend)
- .NET Core SDK (for backend)
- MySQL (for the database)

### Steps to Run

1. **Backend**:
   - Navigate to the backend directory:
     ```bash
     cd Back-End/ElegantJewellery
     ```
   - Update `appsettings.json` with your MySQL credentials.
   - Run the application:
     ```bash
     dotnet run
     ```

2. **Frontend**:
   - Navigate to the frontend directory:
     ```bash
     cd Front-End
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Authenticate and obtain a JWT token.

### Products
- `GET /api/products` - Fetch all products.
- `GET /api/products/{id}` - Fetch a specific product.

### Cart
- `GET /api/cart` - Get user’s cart.
- `POST /api/cart/items` - Add an item to the cart.

### Orders
- `GET /api/orders` - Fetch user orders.
- `POST /api/orders` - Place a new order.

---

## Future Enhancements
- Implement a **Wishlist** feature.
- Add **AR-based virtual try-on** for jewelry.
- Introduce **Personalized Recommendations** using AI.

---

## Contributors
- **Pratik Shahane** - Full-stack Developer
- **Anchal Gupta** - Full-stack Developer
- **Neha Patil** - Full-stack Developer




