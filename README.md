# Flash Wash Frontend

A modern car wash management system built with Next.js.

## Features

- Customer car wash booking.
- Wash package and add-on selection.
- Online payment submission.
- Order status tracking.
- Customer ratings and feedback.
- Admin dashboard for managing orders, workers, and packages.
- Operations dashboard for monitoring wash orders.
- Worker dashboard for managing washing operations.
- Worker attendance management.
- Expenses and financial management.
- Arabic language support.

## Tech Stack

- Next.js
- React
- JavaScript
- CSS
- REST API

## Project Structure

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
├── middleware.js
├── package.json
└── README.md
Installation

Clone the repository:

git clone https://github.com/EslamOsama1/flash-wash-frontend.git

Navigate to the project directory:

cd flash-wash-frontend

Install dependencies:

npm install
Environment Variables

Create a .env.local file in the project root and configure the required environment variables.

Do not commit environment files or expose secret keys.

Run Locally

Start the development server:

npm run dev

Open your browser at:

http://localhost:3000

Build for Production
npm run build
Backend

The frontend requires the Flash Wash backend API to support its application features.

Configure the API base URL according to your environment.

License

All rights reserved.