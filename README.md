# 🚗 Flash Wash

### Smart Car Wash Management System

Flash Wash is a web-based car wash management system designed to simplify car wash operations, manage customer orders, and streamline daily business activities.

The platform provides dedicated interfaces for customers, administrators, operational managers, and workers.

---

## ✨ Features

### 👤 Customer Interface
- Browse available wash packages and additional services.
- Create car wash orders.
- Submit payment information.
- Track order status.
- Rate the service after completing an order.

### 🛠️ Admin Dashboard
- Manage wash orders.
- Manage workers and wash packages.
- Manage payment settings.
- Review orders that require attention.
- Manage expenses and financial records.
- Manage helpers and business settings.

### 📋 Operations Dashboard
- Monitor wash orders.
- Track operational activities.
- Review orders requiring attention.

### 🧽 Worker Dashboard
- View waiting wash orders.
- Manage active washing operations.
- Upload before-and-after photos.
- Record attendance.
- Complete washing tasks.

---

## 🧰 Tech Stack

**Frontend**
- Next.js
- React
- JavaScript
- CSS

**Communication**
- REST API

**Integrations**
- Backend API
- Cloudinary for image uploads
- WhatsApp Business Platform integration

---

## 📁 Project Structure

```text
flash-wash-frontend/
├── app/
│   ├── admin/
│   ├── operations/
│   ├── rating/
│   └── worker/
├── components/
│   ├── admin/
│   ├── customer/
│   ├── operations/
│   ├── shared/
│   └── worker/
├── lib/
├── public/
│   └── images/
├── middleware.js
├── package.json
├── package-lock.json
└── README.md