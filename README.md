Live URL: web-technology-final-assessment-production.up.railway.app


# 🎓 QIU Campus Lost & Found Management System

A full-stack web application for Quest International University to digitally manage lost and found item reports.

## Features

- ✅ Submit lost and found item reports
- ✅ View all items with filtering by category and status
- ✅ Search across titles, descriptions, and locations
- ✅ Full CRUD (Create, Read, Update, Delete)
- ✅ Status tracking (Active → Claimed / Resolved)
- ✅ Responsive mobile-friendly design
- ✅ Server-side input validation & XSS prevention
- ✅ SQL injection prevention via parameterized queries
- ✅ Rate limiting & HTTP security headers (Helmet)

## Tech Stack

| Layer    | Technology                   |
|----------|------------------------------|
| Frontend | HTML5, CSS3, Vanilla JS      |
| Backend  | Node.js + Express            |
| Database | MySQL 8+                     |
| Security | Helmet, express-rate-limit, express-validator, xss |

## Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/campus-lost-found.git
cd campus-lost-found

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Set up the database
mysql -u root -p < database.sql

# 5. Start the server
npm start
```

Visit: http://localhost:3000

### Development mode (auto-reload)
```bash
npm run dev
```

## Project Structure

```
campus-lost-found/
├── config/
│   └── db.js              # Database connection pool
├── middleware/
│   └── validation.js      # Input validation & sanitization
├── routes/
│   └── items.js           # API routes (CRUD)
├── public/
│   ├── index.html         # SPA entry point
│   ├── css/style.css      # Stylesheet
│   └── js/app.js          # Frontend logic
├── database.sql           # Database schema + sample data
├── server.js              # Express app entry point
├── .env.example           # Environment variable template
└── package.json
```

## API Endpoints

| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| GET    | /api/items              | Get all items        |
| GET    | /api/items/:id          | Get single item      |
| POST   | /api/items              | Create new report    |
| PUT    | /api/items/:id          | Update full report   |
| PATCH  | /api/items/:id/status   | Update status only   |
| DELETE | /api/items/:id          | Delete a report      |

### Query parameters for GET /api/items:
- `category` – Filter by `Lost` or `Found`
- `status` – Filter by `Active`, `Claimed`, or `Resolved`
- `search` – Search by title, description, or location

## Security Measures

1. **Server-side validation** – All inputs validated using `express-validator`
2. **XSS prevention** – Input sanitized with `xss` library
3. **SQL injection** – Parameterized queries via `mysql2`
4. **Security headers** – `helmet` sets CSP, HSTS, X-Frame-Options, etc.
5. **Rate limiting** – Global 200 req/15min; API 50 req/15min
6. **Environment variables** – DB credentials stored in `.env` (never committed)

## Environment Variables

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=campus_lost_found
DB_PORT=3306
PORT=3000
NODE_ENV=development
```

## Deployment

The application can be deployed to any Node.js hosting provider:
- **Railway** – Connect GitHub repo and set env vars
- **Render** – Create web service from repo
- **Heroku** – Use Heroku Postgres or ClearDB MySQL add-on

## License

MIT
