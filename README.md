# 🛒 E-commerce Application

A full-stack e-commerce application built with **React** (frontend) and **Spring Boot** (backend).

## 📋 Features

### User Roles
- **Customer**: Browse products, add to cart, place orders, write reviews
- **Seller**: Manage products, view orders, track analytics
- **Admin**: Manage users, products, orders, and view analytics

### Key Features
- 🔐 JWT Authentication & Authorization
- 🛍️ Product browsing with categories
- 🛒 Shopping cart management
- 💳 Payment via VietQR or COD
- 📦 Order tracking with delivery states
- ⭐ Product reviews and ratings
- 📊 Analytics dashboards for Admin & Seller

## 🏗️ Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Axios
- Lucide React (icons)

### Backend
- Spring Boot 3.5.8
- Spring Security (JWT)
- Spring Data JPA
- MySQL Database
- Flyway (database migrations)
- JavaMail (email notifications)

## 🚀 Getting Started

### Prerequisites
- **Java 21** or higher
- **Node.js 16** or higher
- **MySQL 8** or higher
- **Maven 3.8** or higher

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd "Web Final Exam"
```

### 2. Database Setup

Create MySQL database:
```sql
CREATE DATABASE `ecommerce-dev` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend Setup

#### Step 3.1: Configure Environment Variables
```bash
cd backend/Ecommerce
cp env.example .env
```

Edit `.env` file with your values:
```properties
# Database Configuration
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# Admin User Configuration
ADMIN_EMAIL=admin@ecommerce.com
ADMIN_DEFAULT_PASSWORD=Admin@123
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
ADMIN_PHONE_NUMBER=0123456789

# Email Configuration (Gmail with App Password)
# Generate App Password at: https://myaccount.google.com/apppasswords
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Frontend Configuration
FRONTEND_BASE_URL=http://localhost:3000

# JWT Configuration (minimum 256 bits)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-must-be-at-least-256-bits-long
```

**Important Notes:**
- The backend now uses `spring-dotenv` to automatically load `.env` files
- **Never commit your `.env` file** - it contains sensitive credentials
- For Gmail, you must use an [App Password](https://myaccount.google.com/apppasswords), not your regular password
- The `.env` file is already included in `.gitignore`

#### Step 3.2: Install Dependencies & Run
```bash
# Install dependencies and download spring-dotenv
mvn clean install

# Run the application
mvn spring-boot:run

# Or if using VS Code with Java Extension, press F5 to run with debugging
```

Backend will start at: `http://localhost:8080`

**Troubleshooting:**
- If you get "Access denied for user", verify your `DB_PASSWORD` in `.env` matches your MySQL password
- If database connection fails, ensure MySQL is running and `ecommerce-dev` database exists
- The application automatically loads environment variables from `.env` using spring-dotenv dependency

### 4. Frontend Setup

#### Step 4.1: Configure Environment Variables
```bash
cd frontend/ecommerce-app
cp env.example .env
```

Edit `.env` file:
```properties
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_VIETQR_BANK_ID=970422
REACT_APP_VIETQR_ACCOUNT_NO=0123456789
REACT_APP_VIETQR_ACCOUNT_NAME=NGUYEN VAN A
```

#### Step 4.2: Install Dependencies & Run
```bash
# Install dependencies
npm install

# Run the application
npm start
```

Frontend will start at: `http://localhost:3000`

## 📁 Project Structure

```
Web Final Exam/
├── backend/
│   └── ecommerce/
│       ├── src/main/java/com/final_exam/ecommerce/
│       │   ├── config/          # Configuration classes
│       │   ├── controller/      # REST API controllers (to be created)
│       │   ├── service/         # Business logic (to be created)
│       │   ├── repository/      # Data access layer (to be created)
│       │   ├── entity/          # Database models (to be created)
│       │   ├── dto/             # Data transfer objects (to be created)
│       │   ├── security/        # JWT security (to be created)
│       │   └── exception/       # Exception handling (to be created)
│       └── src/main/resources/
│           ├── application.yml  # Application configuration
│           └── db/migration/    # Flyway migrations (to be created)
│
└── frontend/
    └── ecommerce-app/
        └── src/
            ├── api/             # API calls (to be created)
            ├── components/      # Reusable components
            ├── pages/           # Page components
            ├── context/         # React Context (to be created)
            └── utils/           # Utility functions (to be created)
```

## 💳 VietQR Payment Integration

This application uses [VietQR](https://www.vietqr.io/) for generating payment QR codes.

### How it works:
1. Customer places an order
2. System generates VietQR URL with order details
3. Customer scans QR code to pay
4. Admin/Seller manually confirms payment

### VietQR URL Format:
```
https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png?amount={amount}&addInfo={description}&accountName={accountName}
```

### Common Bank IDs:
- `970422`: MB Bank
- `970436`: Vietcombank
- `970415`: Vietinbank
- `970418`: BIDV
- `970405`: Agribank

Full list: https://api.vietqr.io/v2/banks

## 📦 Delivery States

Orders go through the following states:
- `PENDING`: Order placed, awaiting confirmation
- `PROCESSING`: Order confirmed, preparing
- `SHIPPING`: Out for delivery
- `SHIPPED`: In transit
- `DELIVERED`: Successfully delivered
- `CANCELLED`: Cancelled by user/admin
- `RETURNED`: Return requested/processed

## 🔐 Default Users (Development)

After running the application, the following admin user is created:

- **Email**: (from your .env `ADMIN_EMAIL`)
- **Password**: (from your .env `ADMIN_DEFAULT_PASSWORD`)
- **Role**: ADMIN

## 📝 API Documentation

API endpoints will be available at: `http://localhost:8080/api`

### Authentication Endpoints
```
POST /api/auth/register   - Register new user
POST /api/auth/login      - Login & get JWT token
POST /api/auth/logout     - Logout
GET  /api/auth/me         - Get current user info
```

### Product Endpoints
```
GET    /api/products         - List all products
GET    /api/products/{id}    - Get product details
POST   /api/products         - Create product (SELLER/ADMIN)
PUT    /api/products/{id}    - Update product (SELLER/ADMIN)
DELETE /api/products/{id}    - Delete product (SELLER/ADMIN)
```

### Cart Endpoints
```
GET    /api/cart             - Get user's cart
POST   /api/cart/items       - Add item to cart
PUT    /api/cart/items/{id}  - Update cart item
DELETE /api/cart/items/{id}  - Remove from cart
```

### Order Endpoints
```
POST   /api/orders           - Place order
GET    /api/orders           - Get user's orders
GET    /api/orders/{id}      - Get order details
PUT    /api/orders/{id}/status - Update order status (SELLER/ADMIN)
```

## 🛠️ Development Roadmap

### ✅ Phase 0: Foundation Setup (COMPLETED)
- [x] Fix package naming inconsistencies
- [x] Update pom.xml with correct dependencies
- [x] Rename frontend folder
- [x] Create environment variable templates
- [x] Create VietQR configuration

### 📝 Phase 1: Core Backend Structure (NEXT)
- [ ] Create entity layer (database models)
- [ ] Create repository layer
- [ ] Create JWT security layer

### 📝 Phase 2: Authentication & User Management
- [ ] Create DTOs
- [ ] Create auth services
- [ ] Create auth controllers

### 📝 Phase 3: Product Management
- [ ] Product CRUD operations
- [ ] Category management
- [ ] Image upload

### 📝 Phase 4: Shopping Cart
- [ ] Cart operations
- [ ] Cart persistence

### 📝 Phase 5: Order Management & Payment
- [ ] Order creation
- [ ] VietQR integration
- [ ] COD support
- [ ] Delivery state tracking

### 📝 Phase 6: Reviews & Ratings
- [ ] Review system
- [ ] Rating calculations

### 📝 Phase 7: Role-Specific Features
- [ ] Admin dashboard
- [ ] Seller dashboard
- [ ] Customer features

### 📝 Phase 8: Frontend Integration
- [ ] API layer setup
- [ ] State management
- [ ] Connect frontend to backend

## 🤝 Contributing

This is a final exam project. Contributions are not accepted at this time.

## 📄 License

This project is for educational purposes only.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- [VietQR](https://www.vietqr.io/) for payment QR code generation
- Spring Boot team for the excellent framework
- React team for the frontend library

