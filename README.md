# HNG15 Shop

An online shop application built as an individual assignment for the HNG15 internship program. This full-stack project demonstrates e-commerce functionality including product browsing, shopping cart management, user authentication with Google OAuth, and secure order processing.

## Project Overview

HNG15 Shop is a modern, responsive online shopping platform where customers can:
- Browse a curated selection of products with images, descriptions, and pricing
- Add products to a shopping cart with real-time quantity adjustments
- Authenticate securely using Google OAuth
- Complete a checkout process with customer details
- Have orders and order items persisted in a PostgreSQL database (Supabase)

The project showcases a complete e-commerce workflow from product discovery through order placement, with a focus on user experience and data security.

## Features

### Product Management
- Product listing with images, descriptions, prices, and stock information
- Products fetched dynamically from the database
- Display of available stock for each product

### Shopping Cart
- Add products to cart with single click
- Increase and decrease item quantities
- Remove items from cart
- Real-time cart total calculation
- Cart item count display in header
- Immediate notification when items are added to cart

### User Authentication
- Google OAuth integration via Supabase Auth
- Authenticated user display with email
- Sign in and sign out functionality
- User session persistence

### Checkout
- Checkout page accessible when cart contains items
- Customer details form (full name, email, phone, delivery address)
- Order summary display with itemized breakdown
- Order total calculation
- Order creation in Supabase with user association
- Order items stored separately with product and quantity information
- "Back to Shop" navigation throughout the application
- Authentication check before order placement

### Database Security
- Row Level Security (RLS) policies protecting user data
- Authenticated users can only access their own orders and order items
- User-specific data isolation at the database level

## Tech Stack

### Frontend
- **React 19** – UI library
- **Vite** – Fast build tool and dev server
- **React Router 7** – Client-side routing
- **JavaScript** – Programming language
- **CSS** – Styling

### Backend
- **Node.js** – Runtime environment
- **Express 5** – Web framework
- **CORS** – Cross-origin request handling
- **Nodemon** – Development server with auto-reload

### Database & Authentication
- **Supabase** – Backend-as-a-service platform
- **PostgreSQL** – Relational database (via Supabase)
- **Supabase Auth** – Authentication service
- **Google OAuth** – Social login provider

### Additional
- **Mailgun** – Email service integration (see Known Limitations)
- **dotenv** – Environment variable management

## Project Structure

```
hng-shop/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── App.jsx             # Main shop component with routing
│   │   ├── App.css             # Shop styling
│   │   ├── Checkout.jsx        # Checkout page component
│   │   ├── main.jsx            # React entry point
│   │   ├── index.css           # Global styles
│   │   ├── lib/
│   │   │   └── supabase.js     # Supabase client initialization
│   │   ├── services/
│   │   │   └── productService.js  # Product API calls
│   │   ├── assets/             # Images and static files
│   │   ├── package.json        # Frontend dependencies
│   │   ├── vite.config.js      # Vite configuration
│   │   └── index.html          # HTML template
│   └── .env.local              # Frontend environment variables (git-ignored)
│
├── backend/                     # Express.js server
│   ├── server.js               # Main server file with API endpoints
│   ├── package.json            # Backend dependencies
│   └── .env                    # Backend environment variables (git-ignored)
│
├── package.json                # Root dependencies
└── .gitignore                  # Git ignore rules

```

## Database Schema

### `products` table
Stores product information available in the shop.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | text | Product name |
| description | text | Product details |
| price | decimal | Product price in KSh |
| image_url | text | URL to product image |
| stock | integer | Available quantity |
| created_at | timestamp | Record creation time |

### `orders` table
Stores customer orders with Row Level Security enabled.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users (authenticated user) |
| customer_name | text | Customer's full name |
| email | text | Customer's email address |
| phone | text | Customer's phone number |
| address | text | Delivery address |
| total | decimal | Order total amount in KSh |
| created_at | timestamp | Order placement time |

**RLS Policy:** Users can only view and access their own orders (WHERE auth.uid() = user_id).

### `order_items` table
Stores individual items within each order with Row Level Security enabled.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Foreign key to orders table |
| product_id | UUID | Foreign key to products table |
| quantity | integer | Item quantity ordered |
| price | decimal | Price at time of order in KSh |

**RLS Policy:** Users can only view items from their own orders (via order_id relationship and RLS on orders table).

**Relationships:** Each order can have multiple order_items. The order_items table maintains the price at the time of purchase, allowing price history tracking.

## Authentication

### Google OAuth Flow
1. User clicks "Continue with Google" button
2. Supabase redirects to Google's OAuth consent screen
3. User grants permission to access their email
4. Google redirects back to the application with an auth token
5. Supabase stores the session and user information
6. User remains authenticated across page reloads
7. User email is displayed in the header

### Configuration
Google OAuth is configured through:
- **Google Cloud Console** – OAuth 2.0 credentials (Client ID)
- **Supabase Auth Settings** – Google provider configuration
- **Redirect URIs** – Application URLs for OAuth callback

**Note:** Do not commit OAuth client secrets or Supabase keys to version control. Use environment variables instead.

## Environment Variables

Both frontend and backend require `.env` files to function. These files must **never** be committed to GitHub and are listed in `.gitignore`.

### Frontend (`.env.local` in frontend/)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### Backend (`.env` in backend/)
```
PORT=5000
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
MAILGUN_FROM=noreply@your-mailgun-domain
```

## Installation and Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Git**
- Supabase account and project with database tables created
- Google OAuth credentials from Google Cloud Console

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/M-gatwiri/hng-shop.git
   cd hng-shop
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

4. **Install backend dependencies:**
   ```bash
   cd ../backend
   npm install
   ```

5. **Set up environment variables:**

   **Frontend** – Create `frontend/.env.local`:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   ```

   **Backend** – Create `backend/.env`:
   ```
   PORT=5000
   MAILGUN_API_KEY=your-mailgun-api-key
   MAILGUN_DOMAIN=your-mailgun-domain
   MAILGUN_FROM=noreply@yourdomain
   ```

6. **Ensure database tables are created in Supabase:**
   - `products`
   - `orders`
   - `order_items`
   - Enable Row Level Security on `orders` and `order_items` tables

## Running the Project

### Start the Backend
In the `backend/` directory, run:
```bash
npm run dev
```
The backend server will start on `http://localhost:5000` and watch for changes.

### Start the Frontend
In the `frontend/` directory, open a new terminal and run:
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173` (Vite's default port).

### Access the Application
Open your browser and navigate to `http://localhost:5173` to view the shop.

## Checkout Flow

1. **Browse Products** – View all available products on the shop page
2. **Add to Cart** – Click "Add to cart" on any product (notification appears)
3. **Manage Cart** – Adjust quantities, remove items, or add more products
4. **Authentication** – Sign in with Google if not already authenticated
5. **Proceed to Checkout** – Click "Proceed to Checkout" button
6. **Customer Details** – Fill in name, email, phone, and delivery address
7. **Order Placement** – Click "Place Order" to save the order
8. **Order Saved** – Order and items are stored in Supabase with user association
9. **Confirmation** – Success alert displays; cart clears

## Known Limitations

### Mailgun Integration
The backend includes a `/api/send-confirmation` endpoint and Mailgun integration for sending order confirmation emails. However, **confirmation emails are not currently relied upon** due to Mailgun service issues affecting the assignment environment.

The implementation is in place but disabled for practical purposes. To use email confirmations in a production environment:
- Ensure valid Mailgun credentials in `.env`
- Verify domain configuration in Mailgun dashboard
- Call the confirmation endpoint after successful order creation

This will be addressed in future improvements as the service becomes stable.

## Security

### Best Practices
- **.env files excluded** – Environment files are listed in `.gitignore` and never committed
- **Supabase Row Level Security** – All user-specific data is protected by RLS policies
- **User-specific order access** – Users can only view their own orders and order items
- **Secure authentication** – Google OAuth handled through Supabase Auth
- **No secrets in code** – All credentials stored in environment variables

### Data Protection
- Database queries automatically filtered by user ID through RLS
- Orders and order items linked to authenticated users
- Price information preserved at purchase time in `order_items`

## Future Improvements

- **Payment Integration** – Integrate with M-Pesa or Stripe for payment processing
- **Stock Management** – Update product stock after successful order placement
- **Order History Page** – Display customer's past orders and details
- **Order Tracking** – Track order status from processing to delivery
- **Production Deployment** – Configure and deploy to cloud platforms
- **Working Email Service** – Implement stable transactional email service
- **Product Search** – Add search and filtering functionality
- **Admin Panel** – Manage products, orders, and inventory
- **User Profiles** – Save customer information for faster checkout

## Author

**Mercy Gatwiri** – HNG15 Internship Program

## Assignment Context

This project was created as part of the **HNG15 individual assignment**. It demonstrates full-stack web development skills including frontend design, backend API development, database management, authentication implementation, and e-commerce workflows.

---

For questions or issues, please refer to the project repository: [M-gatwiri/hng-shop](https://github.com/M-gatwiri/hng-shop)
