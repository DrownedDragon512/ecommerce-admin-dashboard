# Server-Rendered E-commerce Admin Dashboard

Built with **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, and **Recharts**

**View Demo:**  
https://ecommerce-admin-dashboard-1pn4.vercel.app/dashboard

---

## Overview

This is a **server-rendered e-commerce product management dashboard** built with Next.js.  
It provides a production-ready admin interface with authentication, analytics, product CRUD, image uploads, and AI-powered insights.

The dashboard is designed for **real-world admin workflows**, focusing on performance, clean UI, and scalability.

---

## Tech Stack

This project uses the following stack:

- **Framework** – Next.js 14+ (App Router, SSR)
- **Language** – TypeScript
- **Styling** – Tailwind CSS
- **Charts** – Recharts
- **Forms** – React Hook Form
- **Schema Validation** – Zod
- **Database** – MongoDB
- **Authentication** – JWT
- **Image Storage** – Cloudinary
- **AI Integration** – OpenAI API
- **State Management** – React Query / SWR

---

## Features

### Core Dashboard
- Real-time statistics (products, revenue, stock, sales)
- Monthly sales chart (line + area)
- Revenue by category donut chart
- Sales trends with 7-day & 30-day views
- AI advisor for smart product insights

### Product Management
- Add products using a multi-step form
- Edit and delete products with confirmation modal
- Mark products as sold (units sold tracking)
- Product listing with complete details
- Cloudinary image upload support

### Authentication & Profile
- Admin login/logout using JWT
- Demo admin credentials
- Profile page with editable display name
- Dynamic greeting header
- Avatar with initial-based icon

### UI / UX
- GitHub Dark theme
- Responsive sidebar navigation
- Sticky header with profile access
- Snackbar notifications (success / error / info)
- Smooth transitions and hover effects
- Fully responsive layout

### AI Features
- OpenAI-powered product recommendations
- Fallback rule-based insights if API is unavailable
- Configurable temperature for varied responses

---

## Pages

| Page | Description |
|-----|------------|
| Login | Admin authentication using demo credentials |
| Dashboard | Analytics overview with charts and statistics |
| Products | Product list with edit, delete, and sell actions |
| Add Product | Multi-step product creation form |
| Profile | User profile with display name customization |

---

## 📁 Project Structure

```text
ecommerce-admin-dashboard/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   └── suggest/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── logout/
│   │   │   │   └── route.ts
│   │   │   ├── register/
│   │   │   │   └── route.ts
│   │   │   └── verify/
│   │   │       └── route.ts
│   │   └── products/
│   │       ├── route.ts
│   │       └── [id]/
│   │           ├── route.ts
│   │           ├── route-new.ts
│   │           └── sold/
│   │               └── route.ts
│   │
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── MonthlySalesChart.tsx
│   │   ├── RevenueCategoryChart.tsx
│   │   ├── SalesTrendChart.tsx
│   │   ├── AiAdvisor.tsx
│   │   ├── Snackbar.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── products/
│   │       ├── page.tsx
│   │       ├── new/
│   │       │   └── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
│
├── lib/
│   ├── auth.ts
│   ├── cloudinary.ts
│   └── mongodb.ts
│
├── public/
├── .env.local
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```
---

## Demo Credentials

Email: admin@xyz.com
Password: passforadmin

Email: admin2@xyz.com
Password: passforadmin

---

## Getting Started (Step-by-Step)

Follow these instructions to run the project locally.
- git clone https://github.com/DrownedDragon512/ecommerce-admin-dashboard.git
- cd ecommerce-admin-dashboard
- npm install

- Create a .env.local file in the root directory:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=your_openai_api_key

- npm run dev
- go to http://localhost:3000





