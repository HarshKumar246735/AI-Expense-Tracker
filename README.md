# AI Expense Tracker

A full-stack personal finance app: record income and expenses, set budgets, schedule recurring payments, see analytics, export reports, and let AI help you enter and understand your spending.

Built with **React (Vite)**, **Node.js + Express**, and **MongoDB (Mongoose)**. JavaScript only (no TypeScript, no Tailwind). Every React component has its own `.jsx` and its own `.css` file so problems are easy to isolate.

---

## Table of contents

1. [Features](#1-features)
2. [Tech stack](#2-tech-stack)
3. [How it works (architecture)](#3-how-it-works-architecture)
4. [Project structure](#4-project-structure)
5. [Prerequisites](#5-prerequisites)
6. [Installation, step by step](#6-installation-step-by-step)
7. [MongoDB setup (Atlas or local)](#7-mongodb-setup-atlas-or-local)
8. [Environment variables](#8-environment-variables)
9. [Running the app](#9-running-the-app)
10. [First-use walkthrough](#10-first-use-walkthrough)
11. [Database models](#11-database-models)
12. [Business rules](#12-business-rules)
13. [API reference](#13-api-reference)
14. [AI features in detail](#14-ai-features-in-detail)
15. [Frontend in detail](#15-frontend-in-detail)
16. [Security](#16-security)
17. [Deployment](#17-deployment)
18. [Troubleshooting](#18-troubleshooting)
19. [Manual test checklist](#19-manual-test-checklist)
20. [Known limitations](#20-known-limitations)
21. [Future improvements](#21-future-improvements)
22. [Git workflow and commit strategy](#22-git-workflow-and-commit-strategy)

---

## 1. Features

### Accounts and authentication
- Register with name, email, password and confirm password; log in with email and password; log out.
- Passwords are hashed with bcrypt. Sessions use a JWT stored in an **httpOnly cookie** (JavaScript in the page cannot read it).
- Protected routes on both the API and the frontend. Visiting a protected page while logged out redirects to the login page and returns you to where you were after login.
- Each user can only ever see and change their own data.

### Transactions
- Income and expense records with: type, amount, category, date, description, payment method, notes.
- Create, view, edit and delete, with validation on both the frontend and the backend.
- Transaction history table with **search** (description, notes, category), **filters** (type, category, payment method, date range, amount range), **sorting** (date, amount, category), and **pagination** (10 per page).
- Totals for the current filter (income and expenses) shown above the table.
- Loading skeletons, empty states, and a confirmation dialog before deleting.
- On small screens the table turns into stacked cards.

### Categories
- Default **expense** categories: Food, Shopping, Transport, Rent, Bills, Health, Education, Entertainment, Travel, Other.
- Default **income** categories: Salary, Freelance, Business, Investment, Gift, Other.
- Create, rename, recolor and delete your own categories. Renaming updates all transactions, budgets and recurring items that use it. Deleting moves its transactions to "Other".

### Budgets
- Monthly budget per expense category (for example Food: 7,000 for October 2026).
- Shows budget amount, amount spent, remaining, percentage used and a colour-coded progress bar.
- Warnings at **75%**, **90%** and when **exceeded**, shown on the card and as notifications.
- Invalid values (zero, negative, non-numeric, duplicates for the same category and month) are rejected.

### Recurring transactions
- Rent, salary, subscriptions, EMIs, internet, electricity, insurance, or anything else.
- Fields: name, amount, category, type, frequency (daily, weekly, monthly, yearly), start date, next date, end date.
- Due occurrences are created automatically (by a daily scheduler and also when you use the app).
- Pause and resume, edit, delete. Upcoming ones appear on the dashboard.

### Analytics
- Income vs expenses, expenses by category, monthly spending trend, daily spending, payment-method distribution, savings trend.
- **Monthly**, **yearly** and **custom date range** views.
- Plain-language summaries, for example "Your expenses increased by 18% compared with last month."

### Reports
- Monthly, yearly, category, income and expense reports.
- On-screen preview, then export to **CSV** or **PDF**.

### Notifications
- Budget approaching its limit (75% and 90%), budget exceeded, upcoming recurring payment, unusually large expense, and a monthly summary.
- Bell icon with an unread count in the top bar; full list page with mark-as-read, mark-all-as-read and delete.
- Each alert type can be switched off in Settings.

### Profile and settings
- Profile: name, email, profile picture, currency, monthly income.
- Settings: currency, light/dark theme, notification preferences, change password.

### AI features
- **Natural-language entry:** type "I spent 500 on dinner yesterday" and the form is pre-filled for you to confirm.
- **Automatic categorisation:** suggest a category from the description; you can change it before saving.
- **Spending insights:** highest category, month-over-month change, unusual spending, savings rate.
- **Saving suggestions:** practical, data-based budgeting tips.
- AI output is clearly labelled. Without an API key, built-in rules are used instead.

### UI and experience
- Modern, responsive layout (sidebar on desktop, drawer on mobile), light and dark mode.
- Skeleton loaders on every data-dependent page, empty states, toast notifications, confirmation dialogs, friendly error messages.
- Accessible controls: labels, focus outlines, keyboard-closable dialogs, ARIA attributes, reduced-motion support.

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, React Router 6, Axios, Recharts, lucide-react (icons), react-hot-toast |
| Styling | Plain CSS with CSS variables (theme tokens); one CSS file per component |
| State | React Context (Auth, Theme, Categories) plus a small `useFetch` hook |
| Backend | Node.js 18+, Express 4 |
| Database | MongoDB with Mongoose 8 (aggregation pipelines for analytics) |
| Auth | JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser` |
| Validation | `zod` (request bodies and query strings) |
| Security | `helmet`, `cors`, `express-rate-limit`, `express-mongo-sanitize` |
| Files and reports | `multer` (avatar upload), `pdfkit` (PDF), hand-written CSV |
| Scheduling | `node-cron` |
| AI | Anthropic Messages API through a replaceable provider layer, with a rule-based fallback |
| Tooling | ESLint (backend and frontend), `node --watch` for backend dev |

---

## 3. How it works (architecture)

```
Browser (React + Vite, http://localhost:5173)
   |
   |  Axios requests to /api/...  (httpOnly cookie sent automatically)
   |  In development Vite proxies /api and /uploads to http://localhost:5000
   v
Express API (http://localhost:5000)
   |-- helmet, cors, cookie-parser, JSON body parser, mongo-sanitize, rate limiter
   |-- routes -> middleware (protect, validate, sync) -> controllers
   |-- services: categories, budgets, alerts, notifications, recurring, sync,
   |             analytics, insights, reports, scheduler, ai/
   v
MongoDB (Atlas or local) through Mongoose
```

**Request flow example (adding an expense):**
1. The form calls `POST /api/transactions`.
2. `protect` reads the cookie, verifies the JWT and loads the user.
3. `validate` checks the body with zod.
4. The controller confirms the category belongs to that user, saves the transaction with that user's id.
5. `alertService` checks the matching budget (75/90/100%) and unusual-expense rule, creating notifications if needed.
6. The response uses the standard envelope `{ success, message, data }`.

**Design decisions**
- **Data isolation:** every query includes `userId` taken from the verified token, never from the request body or URL.
- **Dates are UTC calendar days.** A date such as 5 Oct is stored as `2026-10-05T00:00:00Z` and displayed in UTC, so it never shifts by a day between time zones.
- **AI insights use real numbers.** All figures come from MongoDB aggregations; the model only writes the wording and is told never to invent numbers.
- **Graceful fallback.** No API key, or a failed AI call, falls back to rule-based parsing and insights; the app never breaks because AI is unavailable.
- **Recurring transactions are claimed atomically** (`findOneAndUpdate` on the exact `nextDate`), so the cron job and a page load can never create the same transaction twice.
- **Categories are referenced by name** (stored on transactions, budgets, recurring items). Renaming and deleting a category updates those references.

---

## 4. Project structure

```
expense-tracker/
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── eslint.config.js
│   ├── .env.example               <- copy to .env and fill in
│   ├── server.js                  <- connects to MongoDB, starts the server and the scheduler
│   ├── app.js                     <- Express app: security middleware, routes, error handling
│   ├── config/
│   │   ├── env.js                 <- reads and validates environment variables
│   │   └── db.js                  <- MongoDB connection
│   ├── constants/index.js         <- payment methods, currencies, default categories, etc.
│   ├── controllers/               <- request handlers (auth, user, category, transaction,
│   │                                 budget, recurring, analytics, notification, ai, report)
│   ├── middleware/
│   │   ├── auth.js                <- protect: verifies JWT, loads user
│   │   ├── validate.js            <- zod validation and ObjectId check
│   │   ├── rateLimiter.js         <- general, auth and AI limiters
│   │   ├── errorHandler.js        <- notFound + central error handler
│   │   ├── upload.js              <- multer avatar upload
│   │   └── sync.js                <- runs due recurring items and reminders lazily
│   ├── models/                    <- User, Category, Transaction, Budget,
│   │                                 RecurringTransaction, Notification
│   ├── routes/                    <- one router per resource
│   ├── services/
│   │   ├── categoryService.js     <- seed defaults, resolve category names
│   │   ├── budgetService.js       <- budgets with spent/remaining/status
│   │   ├── alertService.js        <- budget and unusual-expense alerts
│   │   ├── notificationService.js <- create notifications (honours user preferences)
│   │   ├── recurringService.js    <- create due recurring transactions
│   │   ├── syncService.js         <- upcoming reminders and monthly summary
│   │   ├── scheduler.js           <- daily cron job
│   │   ├── analyticsService.js    <- aggregation pipelines
│   │   ├── insightsService.js     <- facts, rule-based insights and suggestions
│   │   ├── aiService.js           <- AI orchestration, prompts, caching, fallback
│   │   ├── reportService.js       <- report data, CSV and PDF
│   │   └── ai/
│   │       ├── index.js           <- chooses the provider, extracts JSON from replies
│   │       ├── claudeProvider.js  <- Anthropic API call
│   │       └── ruleBasedParser.js <- no-API-key text parser and classifier
│   ├── utils/                     <- ApiError, asyncHandler, response helper, dates,
│   │                                 money, token (cookie), regex escape, TTL cache
│   ├── validators/schemas.js      <- every zod schema
│   └── uploads/avatars/           <- uploaded profile pictures (git-ignored)
└── frontend/
    ├── package.json
    ├── vite.config.js             <- dev server and proxy to the backend
    ├── eslint.config.js
    ├── index.html
    └── src/
        ├── main.jsx               <- entry point
        ├── App.jsx                <- providers and routes (pages are lazy-loaded)
        ├── index.css              <- imports the two CSS files below
        ├── css/
        │   ├── variables.css      <- light and dark theme tokens
        │   └── global.css         <- shared utility classes (buttons, inputs, cards, badges...)
        ├── api/                   <- Axios client + one file per resource
        ├── context/               <- AuthContext, ThemeContext, CategoryContext
        ├── hooks/                 <- useAuth, useTheme, useCategories, useCurrency,
        │                             useDebounce, useFetch
        ├── layouts/               <- AppLayout (sidebar + top bar), AuthLayout
        ├── utils/                 <- constants, format helpers, error helpers
        ├── components/            <- reusable pieces, each with its own .css
        └── pages/                 <- one page per route, each with its own .css (where needed)
```

---

## 5. Prerequisites

| Tool | Version | Check with |
|---|---|---|
| Node.js | 18 or newer (20+ recommended) | `node -v` |
| npm | comes with Node | `npm -v` |
| MongoDB | Atlas free cluster **or** local MongoDB Community Server | see section 7 |
| (Optional) Anthropic API key | for real AI results | https://console.anthropic.com |

`node --watch` (used by `npm run dev` in the backend) needs Node 18.11 or newer.

---

## 6. Installation, step by step

> **Windows tip:** keep the project outside OneDrive (for example `C:\dev\expense-tracker`). OneDrive syncing a large `node_modules` folder can cause strange install errors.

### Step 1: get the code
Unzip the project (or clone your repository) so you have a folder with `backend/` and `frontend/` inside.

### Step 2: install and configure the backend
```bash
cd backend
npm install
```
Create your environment file:
```bash
# macOS / Linux
cp .env.example .env

# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```
Open `backend/.env` and fill in `MONGO_URI` and `JWT_SECRET` (see section 8). Generate a secret with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Step 3: install the frontend
```bash
cd ../frontend
npm install
```

### Step 4: make sure MongoDB is reachable
Follow section 7. For Atlas, the most common problem is forgetting to allow your IP address.

### Step 5: run both servers
Open **two terminals** (see section 9).

---

## 7. MongoDB setup (Atlas or local)

### Option A: MongoDB Atlas (cloud, free)
1. Go to https://www.mongodb.com/atlas and create an account.
2. Create a free **M0** cluster.
3. **Database Access** -> **Add New Database User**. Choose a username and a password made of letters and numbers only (special characters must be URL-encoded in the connection string). Give it "Read and write to any database".
4. **Network Access** -> **Add IP Address** -> **Add Current IP Address** -> **Confirm**. For quick local testing only you may use `0.0.0.0/0` ("allow from anywhere"); remove it before deploying. Wait until the status says **Active**.
5. **Database** -> **Connect** -> **Drivers**. Copy the connection string, which looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Put your username and password in it and **add the database name** before the `?`:
   ```
   MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority
   ```
   The database and collections are created automatically on first use.

Things to remember:
- Your IP address changes when you switch Wi-Fi, use a hotspot or a VPN. Add the new IP in Network Access.
- Free clusters pause after inactivity; press **Resume** on the cluster page.
- Never paste your real connection string or password into chats, issues or screenshots. If you do, reset the password in Database Access.

### Option B: local MongoDB
1. Install **MongoDB Community Server** from https://www.mongodb.com/try/download/community (on Windows keep "Install MongoDB as a Service" ticked).
2. Make sure it is running:
   - Windows: open `services.msc`, find **MongoDB Server**, **Start**.
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
3. Use this in `.env`:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/expense-tracker
   ```
   (`127.0.0.1` is more reliable than `localhost` on newer Node versions.)

---

## 8. Environment variables

All backend variables live in `backend/.env`. **Never commit this file** (it is in `.gitignore`).

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URI` | **Yes** | none | MongoDB connection string, including the database name. The server exits with a clear message if missing. |
| `JWT_SECRET` | **Yes in production** | random (dev only) | Secret used to sign login tokens. In development, if empty, a temporary secret is generated and a warning is printed (you get logged out on every restart). In production the server refuses to start without it. |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime (the cookie lasts 7 days). |
| `PORT` | No | `5000` | API port. If you change it, also change the proxy target in `frontend/vite.config.js`. |
| `NODE_ENV` | No | `development` | Set to `production` when deploying (enables Secure cookies, hides error details, trusts the proxy). |
| `CLIENT_URL` | No | `http://localhost:5173` | The one origin allowed by CORS. |
| `COOKIE_SAMESITE` | No | `lax` | `lax`, `strict` or `none`. `none` forces the Secure flag and needs HTTPS. |
| `AI_API_KEY` | No | empty | Anthropic API key. Empty means the rule-based fallback is used. `ANTHROPIC_API_KEY` is also accepted. |
| `AI_MODEL` | No | `claude-haiku-4-5-20251001` | Model used for AI features. |

The frontend has **no environment variables**. It calls the relative URL `/api`, which Vite proxies to the backend in development.

Example `backend/.env`:
```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority
JWT_SECRET=put_a_long_random_string_here
JWT_EXPIRES_IN=7d
COOKIE_SAMESITE=lax
AI_API_KEY=
AI_MODEL=claude-haiku-4-5-20251001
```

---

## 9. Running the app

### Development
| Terminal | Folder | Command | Result |
|---|---|---|---|
| 1 | `backend` | `npm run dev` | API on http://localhost:5000, restarts on file changes |
| 2 | `frontend` | `npm run dev` | App on http://localhost:5173 |

Healthy backend output:
```
MongoDB connected
Server running on port 5000 (development)
```
Quick API check: open http://localhost:5000/api/health, which returns `{"success":true,"message":"API is running",...}`.

### Scripts
| Folder | Script | What it does |
|---|---|---|
| backend | `npm run dev` | `node --watch server.js` |
| backend | `npm start` | `node server.js` (production) |
| backend | `npm run lint` | ESLint |
| frontend | `npm run dev` | Vite dev server |
| frontend | `npm run build` | Production build into `frontend/dist` |
| frontend | `npm run preview` | Serve the production build locally |
| frontend | `npm run lint` | ESLint |

---

## 10. First-use walkthrough

1. Open http://localhost:5173 and **register**. Default categories are created for you.
2. Go to **Add transaction**. Try the AI box: type `I spent 500 on dinner yesterday` and press **Extract details**. Review the pre-filled form, change anything you like, and save.
3. Go to **Budgets**, create a Food budget for this month (for example 1000). Add Food expenses until you pass 75%, 90% and 100% and watch the notifications appear.
4. Go to **Recurring** and add a monthly item with a start date of today. It is created as a transaction immediately and then on each due date.
5. Open **Dashboard** and **Analytics** to see charts and summaries.
6. Open **Reports**, generate a report, then export CSV and PDF.
7. In **Settings**, switch to dark mode and turn notification types on or off.

---

## 11. Database models

All collections include `createdAt` and `updatedAt` (Mongoose timestamps).

### User
| Field | Type | Notes |
|---|---|---|
| name | String | required, 2-60 characters |
| email | String | required, unique, lower-cased |
| password | String | bcrypt hash, **never returned** (`select: false`) |
| avatar | String | public path such as `/uploads/avatars/<file>` |
| currency | String | `INR, USD, EUR, GBP, AED, JPY, AUD, CAD, SGD` (default `INR`) |
| monthlyIncome | Number | 0 or more |
| theme | String | `light` or `dark` |
| notificationPrefs | Object | `budgetAlerts`, `recurringReminders`, `unusualExpense`, `monthlySummary` (all default true) |

### Category
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId | owner |
| name | String | up to 40 characters |
| type | String | `income` or `expense` |
| color | String | hex colour such as `#3b5bdb` |
| isDefault | Boolean | true for the seeded defaults |

Unique index on `(userId, type, name)` with a case-insensitive collation.

### Transaction
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId | owner |
| type | String | `income` or `expense` |
| amount | Number | greater than 0, at most 1,000,000,000 |
| category | String | name of one of the user's categories of the same type |
| date | Date | UTC calendar day |
| description | String | required, up to 200 characters |
| paymentMethod | String | Cash, UPI, Debit Card, Credit Card, Bank Transfer, Net Banking, Other |
| notes | String | optional, up to 1000 characters |
| recurringId | ObjectId | set when created by a recurring rule |

Indexes: `(userId, date desc)` and `(userId, type, category, date desc)`.

### Budget
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId | owner |
| category | String | an expense category |
| amount | Number | at least 1 |
| month | Number | 1-12 |
| year | Number | 2000-2100 |

Unique index on `(userId, category, year, month)`.

### RecurringTransaction
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId | owner |
| name | String | up to 100 characters |
| amount | Number | greater than 0 |
| category | String | category name |
| type | String | `income` or `expense` |
| frequency | String | `daily, weekly, monthly, yearly` |
| paymentMethod | String | as for transactions |
| startDate | Date | schedule anchor |
| nextDate | Date | next occurrence to create |
| endDate | Date or null | optional end |
| active | Boolean | false when paused or finished |
| lastRunAt | Date | last time an occurrence was created |

### Notification
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId | owner |
| type | String | `budget_warning, budget_exceeded, recurring_upcoming, unusual_expense, monthly_summary` |
| severity | String | `info, warning, danger` |
| title, message | String | what the user sees |
| read | Boolean | default false |
| dedupeKey | String | stops the same alert being created twice |

Unique partial index on `(userId, dedupeKey)`.

---

## 12. Business rules

### Categories
- Names are unique per user, per type, ignoring case.
- A category's **type cannot be changed** after creation.
- The default **"Other"** category cannot be renamed or deleted (it is where transactions go when their category is deleted).
- Renaming a category updates its transactions, recurring items and (for expenses) budgets.
- Deleting a category moves its transactions and recurring items to "Other" and deletes its budgets. The API returns how many transactions were moved.
- A transaction, budget or recurring item can only use a category that exists for that user and matches the type (budgets: expense only).

### Budgets
- One budget per category per month.
- `percentUsed = spent / amount x 100`, where `spent` is the sum of that month's expenses in the category.
- Status: `ok` (under 75%), `warning` (75% or more), `critical` (90% or more), `exceeded` (100% or more).
- Alerts fire after an expense is created or updated, after a budget is created or edited, and when due recurring expenses are added. Only the highest level reached produces a notification, once per level (`dedupeKey = budget:<id>:<75|90|100>`).
- Editing a budget's amount clears its earlier alerts and re-evaluates; deleting a budget deletes its alerts.

### Unusual expense
An expense triggers a warning when it is at least **3 times** the average expense of the same category over the previous **180 days**, and there are at least **5** earlier expenses in that category.

### Recurring transactions
- On creation, `nextDate` = the first occurrence **on or after today** (UTC). A start date in the past does **not** back-fill old transactions; add those manually if you need them. You can override `nextDate` when editing.
- Monthly and yearly schedules stay on the original day where possible (a rule starting on the 31st runs on Feb 28/29, then Mar 31). Yearly rules on Feb 29 run on Feb 28 in non-leap years.
- Each due occurrence creates a transaction dated on its due date, with the rule's name as the description and the note "Added automatically (recurring)".
- Due items are processed: by a **cron job every day at 00:05 server time**, **once at server start**, and **lazily** (at most once per minute per user) when you load transactions, recurring items, the analytics summary or notifications. If the server was off for days, the missed occurrences (up to 400 per rule) are created next time.
- When `nextDate` passes `endDate`, the rule becomes inactive ("Ended").
- A reminder notification is created when an active item is due within the next **3 days** (one per occurrence).

### Monthly summary
Once per calendar month, a notification summarises the previous month (earned, spent, saved or overspent), only if that month had transactions.

### Analytics definitions
- **Total balance** = all-time income minus all-time expenses.
- **Savings (this month)** = income minus expenses for the selected period.
- **Comparison:** a whole calendar month is compared with the previous calendar month ("last month"); any other range is compared with the equally long period immediately before it ("the previous period").
- **Default ranges:** summary, categories, daily and payment-methods default to the **current month**; monthly defaults to the **last 12 months**.
- Daily data is capped to 366 days, and the monthly series to 60 months.

### Dates and time zones
Dates are calendar days stored as UTC midnight and shown in UTC, so what you pick is what you see. "Current month" is determined by the server's UTC date; around midnight in your local time zone the boundary can differ slightly from your local calendar.

### Currency
Changing currency only changes how amounts are displayed. Stored amounts are not converted.

---

## 13. API reference

**Base URL:** `http://localhost:5000/api` (in the browser, use the relative `/api`).

### Conventions
- JSON requests (`Content-Type: application/json`), body limit **10 KB** (avatar upload excepted).
- Authentication: after login or register, the server sets an httpOnly cookie named `token`. Send it with every request (browsers do this automatically; with curl use a cookie jar). An `Authorization: Bearer <token>` header is also accepted.
- Success: `{ "success": true, "message": "...", "data": { ... } }`
- Error: `{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }` (`errors` appears for validation failures; `stack` appears only outside production for 5xx errors).

| Status | Meaning |
|---|---|
| 200 / 201 | OK / created |
| 400 | Validation failed, invalid id, or invalid business rule |
| 401 | Not logged in, session expired, or bad credentials |
| 403 | Forbidden (reserved; data from other users returns 404) |
| 404 | Resource or route not found (also used when a record belongs to someone else) |
| 409 | Conflict (duplicate email, category or budget) |
| 413 | Request body too large |
| 422 | AI could not find an amount in the text |
| 429 | Rate limit exceeded |
| 500 | Server error (details hidden in production) |

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | no | `{ status: "ok", uptime }` |

### Auth
| Method | Path | Auth | Body | Result |
|---|---|---|---|---|
| POST | `/auth/register` | no | `name, email, password, confirmPassword` | 201, `{ user }`, sets cookie. 409 if email exists. |
| POST | `/auth/login` | no | `email, password` | `{ user }`, sets cookie. 401 "Invalid email or password". |
| POST | `/auth/logout` | no | none | clears the cookie |
| GET | `/auth/me` | yes | none | `{ user }` |

Password rules: 8-72 characters, at least one letter and one number.

### Users
| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/users/profile` | none | current user |
| PUT | `/users/profile` | `name?, email?, currency?, monthlyIncome?` | 409 if email is taken |
| PUT | `/users/settings` | `currency?, theme?, notificationPrefs?` | `notificationPrefs` accepts any of the four booleans |
| PUT | `/users/password` | `currentPassword, newPassword, confirmPassword` | 400 if the current password is wrong |
| POST | `/users/avatar` | multipart field `avatar` | JPG, PNG or WebP, max 2 MB; replaces the old picture |

### Categories
| Method | Path | Body or query | Notes |
|---|---|---|---|
| GET | `/categories` | `?type=income\|expense` | sorted by type then name |
| POST | `/categories` | `name, type, color?` | 409 duplicate |
| PUT | `/categories/:id` | `name, type, color` | `type` must equal the existing type |
| DELETE | `/categories/:id` | none | returns `{ movedTransactions }` |

### Transactions
| Method | Path | Description |
|---|---|---|
| GET | `/transactions` | List with filters (below) |
| POST | `/transactions` | Create |
| GET | `/transactions/:id` | Get one |
| PUT | `/transactions/:id` | Replace fields (same body as create) |
| DELETE | `/transactions/:id` | Delete |

**Create/update body**
```json
{
  "type": "expense",
  "amount": 500,
  "category": "Food",
  "date": "2026-10-06",
  "description": "Dinner",
  "paymentMethod": "UPI",
  "notes": ""
}
```
`date` defaults to now, `paymentMethod` defaults to `Other`, `notes` is optional.

**List query parameters**
| Param | Default | Description |
|---|---|---|
| `page` | 1 | page number |
| `limit` | 10 | 1-100 |
| `search` | none | case-insensitive match in description, notes, category |
| `type` | none | `income` or `expense` |
| `category` | none | exact category name |
| `paymentMethod` | none | one of the payment methods |
| `startDate`, `endDate` | none | inclusive date range (`YYYY-MM-DD`) |
| `minAmount`, `maxAmount` | none | amount range |
| `sortBy` | `date` | `date`, `amount`, `category`, `createdAt` |
| `order` | `desc` | `asc` or `desc` |

**List response**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [ { "_id": "...", "type": "expense", "amount": 500, "category": "Food", "date": "2026-10-06T00:00:00.000Z", "description": "Dinner", "paymentMethod": "UPI", "notes": "" } ],
    "totals": { "income": 0, "expenses": 500 },
    "pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
  }
}
```
`totals` covers **all** transactions matching the filters, not just the current page.

### Budgets
| Method | Path | Body or query | Notes |
|---|---|---|---|
| GET | `/budgets` | `?month=10&year=2026` (default current) | each item includes `spent, remaining, percentUsed, status`; also returns `totals` |
| POST | `/budgets` | `category, amount, month?, year?` | expense categories only; 409 if one exists for that month |
| PUT | `/budgets/:id` | `category, amount, month, year` | resets that budget's alerts |
| DELETE | `/budgets/:id` | none | deletes its alerts |

### Recurring
| Method | Path | Body or query | Notes |
|---|---|---|---|
| GET | `/recurring` | `?upcoming=true&limit=5` | `upcoming=true` returns active items ordered by next date |
| POST | `/recurring` | `name, amount, category, type, frequency, startDate, paymentMethod?, nextDate?, endDate?, active?` | `endDate` must not be before `startDate` |
| PUT | `/recurring/:id` | same | changing frequency or start date recomputes `nextDate` |
| DELETE | `/recurring/:id` | none | transactions already created are kept |

### Analytics
All accept `startDate` and `endDate` (inclusive, `YYYY-MM-DD`).

| Method | Path | Returns |
|---|---|---|
| GET | `/analytics/summary` | `allTime {income, expenses, balance, transactionCount}`, `period {income, expenses, savings, transactionCount, previous, expenseChangePct, incomeChangePct, comparisonLabel}`, `highlights []` |
| GET | `/analytics/monthly` | `months [{ month: "2026-10", income, expenses, savings }]` |
| GET | `/analytics/categories` | `categories [{ category, total, count, percent, color }]` (`?type=income\|expense`, default expense) |
| GET | `/analytics/daily` | `days [{ date, total }]` with zero-filled gaps (`?type`, default expense) |
| GET | `/analytics/payment-methods` | `methods [{ method, total, count, percent }]` (expenses) |

### Reports
`GET /reports?type=<type>&format=<format>` plus parameters by type.

| `type` | Parameters | Content |
|---|---|---|
| `monthly` | `month, year` (default current) | all transactions of the month |
| `yearly` | `year` | 12-row table: income, expenses, savings per month |
| `category` | `startDate, endDate` (default this year) | totals and share per category, income and expense |
| `income` | `startDate, endDate` | income transactions |
| `expense` | `startDate, endDate` | expense transactions |

`format`: `json` (default, used for the preview), `csv`, or `pdf` (file download). Reports are limited to 5,000 transaction rows.
- CSV: UTF-8 with BOM (opens correctly in Excel), amounts as plain numbers, text cells that start with `= + - @` are escaped to prevent formula injection.
- PDF: A4 table with a header, summary lines and paging. Amounts are printed with the currency code (for example `INR 1,250.00`).

### Notifications
| Method | Path | Notes |
|---|---|---|
| GET | `/notifications` | `?page&limit&unread=true`; returns `items`, `unreadCount`, `pagination`; also triggers the lazy sync |
| GET | `/notifications/unread-count` | lightweight count for the bell |
| PATCH | `/notifications/read-all` | mark all as read |
| PATCH | `/notifications/:id/read` | mark one as read |
| DELETE | `/notifications/:id` | delete |

### AI
Limited to 20 requests per minute per IP. Details in section 14.

| Method | Path | Body | Result |
|---|---|---|---|
| POST | `/ai/parse-expense` | `{ "text": "I spent 500 on dinner yesterday" }` | `{ source, aiGenerated, transaction: { type, amount, category, description, date, paymentMethod } }` |
| POST | `/ai/categorize` | `{ "text": "groceries from supermarket" }` | `{ source, aiGenerated, type, category }` |
| POST | `/ai/insights` | `{ "refresh": false }` | `{ items: [{ title, text, tone }], generatedBy, aiGenerated, month, disclaimer }` |
| POST | `/ai/suggestions` | `{ "refresh": false }` | same shape as insights |

### Trying the API with curl
```bash
# register (stores the cookie in cookies.txt)
curl -c cookies.txt -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Passw0rd123","confirmPassword":"Passw0rd123"}' \
  http://localhost:5000/api/auth/register

# add an expense
curl -b cookies.txt -H "Content-Type: application/json" \
  -d '{"type":"expense","amount":500,"category":"Food","description":"Dinner","paymentMethod":"UPI"}' \
  http://localhost:5000/api/transactions

# list transactions
curl -b cookies.txt "http://localhost:5000/api/transactions?type=expense&limit=5"

# parse natural language
curl -b cookies.txt -H "Content-Type: application/json" \
  -d '{"text":"I spent 500 on dinner yesterday"}' http://localhost:5000/api/ai/parse-expense
```

---

## 14. AI features in detail

### Provider layer
`backend/services/ai/index.js` returns the active provider (or `null` when no key is set). A provider is any object with:
```js
{ name: "claude", async complete({ system, prompt, maxTokens }) { /* returns a string */ } }
```
To switch vendor, add a file next to `claudeProvider.js` with that shape and return it from `index.js`. Nothing else changes. Calls time out after 20 seconds, and any failure falls back to the rule-based logic.

### 1. Natural-language entry (`/ai/parse-expense`)
- The model gets your category names, today's date and strict instructions to return one JSON object (type, amount, category, description, date, paymentMethod).
- The reply is validated with zod. The category must be one of **your** categories (otherwise "Other"); the date must be within 5 years of today (otherwise today).
- If there is no amount in the text, the API answers 422 with a helpful example.
- On the Add Transaction page the result **pre-fills the form**; nothing is saved until you press Save, and you can change the category and every other field.

### 2. Automatic categorisation (`/ai/categorize`)
The "Auto-categorize" button next to the description suggests a type and category. It only changes the form fields; you confirm by saving.

### 3 and 4. Insights and saving suggestions
1. The server computes **facts** with MongoDB aggregations: top category, expenses this month vs last month, categories well above your usual monthly average, unusual expenses, budget status, recurring cost estimate, savings rate.
2. The facts are sent to the model, which is told to use only those names and numbers, never to invent figures, never to give investment, tax, legal or credit advice, never to suggest skipping essential bills or borrowing, and to return a short JSON list.
3. If the AI is unavailable, the same facts are turned into text by built-in rules.
4. Results are cached per user for 5 minutes; the refresh button bypasses the cache.
5. With fewer than 3 transactions (or none in the last two months) you get a "Not enough data yet" message and no AI call is made.

Labels shown in the UI: **"AI-generated"** when the model wrote it, **"Auto-generated from your data"** for rule-based output, plus a disclaimer that it is general budgeting guidance, not financial advice.

### Rule-based fallback (no API key)
- Amounts: `500`, `1,250`, `₹500`, `Rs. 500`, `INR 500`, `$20`, `5k`, `2 lakh`.
- Dates: today, tonight, yesterday, day before yesterday, `N days ago`, last week, `YYYY-MM-DD`.
- Type: income words (salary, received, earned, credited, bonus, refund, dividend, freelance, "paid me"...) otherwise expense.
- Category: keyword lists (pizza, uber, rent, electricity, netflix, ...) mapped to your categories, otherwise "Other".
- Payment method: UPI/GPay/PhonePe/Paytm, credit card, debit card, net banking, bank transfer/NEFT/IMPS, cash.

Example: `Bought groceries from supermarket for ₹1,250` becomes Expense, 1250, Food, "Groceries from supermarket", today.

### Privacy note
When an AI key is set, the text you type (and, for insights, aggregated numbers plus short descriptions of your largest unusual expenses) is sent to the AI provider. Leave `AI_API_KEY` empty if you do not want that.

---

## 15. Frontend in detail

### Routes
| Path | Page | Access |
|---|---|---|
| `/login` | Login | public (redirects to dashboard if logged in) |
| `/register` | Register | public |
| `/dashboard` | Dashboard | protected |
| `/transactions` | Transactions list | protected |
| `/transactions/add` | Add transaction (with AI box) | protected |
| `/transactions/:id/edit` | Edit transaction | protected |
| `/categories` | Categories | protected |
| `/budgets` | Budgets | protected |
| `/recurring` | Recurring transactions | protected |
| `/analytics` | Analytics | protected |
| `/reports` | Reports | protected |
| `/notifications` | Notifications | protected |
| `/profile` | Profile | protected |
| `/settings` | Settings | protected |
| `*` | 404 page | public |

Pages are lazy-loaded, so charts are only downloaded when needed.

### Dashboard sections
Stat cards (total balance, total income, total expenses, savings this month, number of transactions), highlights, income vs expenses (6 months), expenses by category, monthly expense trend, budget progress, insights panel (insights and saving tips), recent transactions, upcoming recurring transactions. Each section has its own skeleton while loading.

### Context and hooks
| Name | Purpose |
|---|---|
| `AuthContext` / `useAuth` | current user, login, register, logout, `updateUser`; checks `/auth/me` on load |
| `ThemeContext` / `useTheme` | light/dark theme; saved in `localStorage` and, when logged in, in your settings |
| `CategoryContext` / `useCategories` | the user's categories, `byType(type)`, `refresh()` |
| `useFetch(fetcher, deps, { enabled })` | `{ data, loading, error, reload }` with cancellation on unmount |
| `useDebounce` | debounced search input |
| `useCurrency` | `fmt`, `compact` formatters using the user's currency |

### API layer
`src/api/client.js` creates one Axios instance (`baseURL: "/api"`, `withCredentials: true`). A response interceptor returns the `{ success, message, data }` envelope and, on a 401 from a protected call, logs the user out in the UI. Errors are turned into friendly messages by `utils/errors.js`.

### Components (each has a matching `.css`)
`Modal`, `ConfirmDialog`, `SkeletonLoader`, `EmptyState`, `ProgressBar`, `StatCard`, `PageHeader`, `Pagination`, `Avatar`, `ThemeToggle`, `NotificationBell`, `Sidebar`, `Topbar`, `FilterBar`, `TransactionTable`, `TransactionForm`, `AIExpenseInput`, `DonutChart`, `IncomeExpenseChart`, `TrendChart`, `BudgetCard`, `BudgetForm`, `CategoryForm`, `RecurringForm`, `InsightsPanel`, `RecentTransactions`, `UpcomingRecurring`, `BudgetProgress`, plus the `ProtectedRoute`/`PublicRoute` guards.

### Theming
Colours are CSS variables in `src/css/variables.css`; dark mode overrides them under `:root[data-theme="dark"]`. Shared utility classes (`.btn`, `.card`, `.input`, `.badge`, `.field`...) live in `src/css/global.css`; everything else is in the component's own CSS file. Charts read the same variables so they follow the theme.

### Responsive behaviour
- Under 900 px the sidebar becomes a slide-in drawer opened from the top bar.
- Under 800 px two- and three-column grids collapse to one column.
- Under 760 px the transactions table turns into stacked cards.

### Error and loading handling
Every data-dependent page shows a skeleton while loading, an inline error with a **Retry** button if the request fails, and an empty state with a call to action when there is no data. Form errors are shown next to the field, and server errors appear as toasts.

---

## 16. Security

| Area | What is done |
|---|---|
| Passwords | bcrypt (cost 12), 8-72 characters with a letter and a number; never returned by the API |
| Sessions | JWT in an httpOnly cookie, `SameSite=Lax`, `Secure` in production; 7-day lifetime; logout clears it |
| Authorization | `protect` middleware on every private route; every query is scoped to the token's user id; other users' records return 404 |
| Login | identical error for unknown email and wrong password (no account enumeration); auth endpoints are rate limited |
| Validation | zod on every body and query string; ObjectId format checked on `:id` params |
| Injection | `express-mongo-sanitize` strips `$` and `.` operators; search text is regex-escaped |
| HTTP hardening | `helmet` headers; CORS limited to `CLIENT_URL` with credentials; 10 KB body limit |
| Rate limits | 1,500 requests / 15 min per IP overall; 30 failed attempts / 15 min on login, register and password change; 20 / minute on AI routes |
| Uploads | allow-list of JPG/PNG/WebP, 2 MB, extension taken from the verified mime type, random name, old file removed |
| Exports | CSV cells starting with `= + - @` are escaped (formula injection) |
| Errors | one central handler; stack traces and internal messages are hidden in production |
| Secrets | everything in environment variables; `.env` is git-ignored; server refuses to start in production without `JWT_SECRET` |
| AI | only validated, structured output is used; prompts forbid risky financial advice; insights never contain model-invented numbers |

Because authentication uses cookies, keep the frontend and API on the same site (see deployment). If you ever host them on different sites, add CSRF protection.

---

## 17. Deployment

The frontend calls the **relative** path `/api`, so in production the browser must reach both the frontend and the API on the same origin (or the same site). The simplest setup is a reverse proxy.

### Option A: single server with a reverse proxy (Nginx example)
```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/expense-tracker/frontend/dist;
  index index.html;

  location /api/     { proxy_pass http://127.0.0.1:5000; }
  location /uploads/ { proxy_pass http://127.0.0.1:5000; }
  location /         { try_files $uri /index.html; }   # single-page app routing
}
```
Steps:
1. `cd frontend && npm run build` and publish `dist/`.
2. On the server: `cd backend && npm install --omit=dev`, set the environment variables (`NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL=https://example.com`), then run `npm start` under a process manager such as PM2.
3. Serve everything over **HTTPS** (needed for Secure cookies).

### Option B: static frontend host with rewrites
Host `frontend/dist` on Vercel or Netlify and rewrite `/api/*` and `/uploads/*` to your backend URL. Vercel `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/:path*",     "destination": "https://YOUR-BACKEND-HOST/api/:path*" },
    { "source": "/uploads/:path*", "destination": "https://YOUR-BACKEND-HOST/uploads/:path*" },
    { "source": "/(.*)",           "destination": "/index.html" }
  ]
}
```
Netlify `_redirects` (in `frontend/public`):
```
/api/*      https://YOUR-BACKEND-HOST/api/:splat      200
/uploads/*  https://YOUR-BACKEND-HOST/uploads/:splat  200
/*          /index.html                                200
```
With rewrites the browser only talks to the frontend domain, so cookies stay first-party and `COOKIE_SAMESITE=lax` works.

### Backend hosting notes (Render, Railway, etc.)
- Start command: `npm start`; build command: `npm install`.
- Set `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, optional AI variables.
- In MongoDB Atlas **Network Access**, allow your host's outbound IPs (or `0.0.0.0/0` for simple hosts).
- Free hosts may sleep when idle; the first request after a pause is slow.
- Avatars are saved to local disk. On hosts with ephemeral disks they disappear on redeploy; switch to cloud storage for production.
- The scheduler runs inside the API process, so keep one instance running. Missed recurring items are caught up on the next start or visit.

### Production checklist
- [ ] `NODE_ENV=production` and a strong `JWT_SECRET`
- [ ] HTTPS enabled
- [ ] Atlas password rotated, IP allow-list reviewed (no `0.0.0.0/0` unless required)
- [ ] `CLIENT_URL` matches the public frontend URL
- [ ] `.env` is not in Git
- [ ] Backups enabled for the database

---

## 18. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find module 'helmet'` (or `zod`, `bcryptjs`, ...) | Backend packages not installed | `cd backend && npm install`; verify with `npm ls helmet zod bcryptjs` |
| Frontend: `Failed to resolve import "react-router-dom"` (or axios, recharts...) | Frontend packages not installed | `cd frontend && npm install` |
| `WARNING: JWT_SECRET is not set` | Only a warning in development | Add `JWT_SECRET` to `backend/.env`; generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `Missing required environment variable: MONGO_URI` | `.env` missing, misnamed or in the wrong folder | It must be named exactly `.env` and sit inside `backend/` next to `server.js`. On Windows check that it is not `.env.txt` |
| `Failed to start server: Could not connect to any servers in your MongoDB Atlas cluster` | Your IP is not allowed | Atlas -> Network Access -> Add Current IP -> wait until Active -> restart the backend (`Ctrl+C`, `npm run dev`) |
| Same Atlas error after adding the IP | Cluster paused, IP changed, VPN, or a network that blocks Atlas | Resume the cluster, add the new IP, turn off VPN, try a mobile hotspot |
| `bad auth` / `Authentication failed` | Wrong username or password in `MONGO_URI` | Reset the password in Database Access (letters and numbers only) and update `.env` |
| `querySrv ENOTFOUND` / `querySrv ECONNREFUSED` | DNS or network blocks `mongodb+srv` | Try another network, or use Atlas's standard (non-SRV) connection string |
| `connect ECONNREFUSED 127.0.0.1:27017` | Local MongoDB is not running | Start the MongoDB service (section 7, option B) |
| `The uri parameter ... must be a string, got "undefined"` | `MONGO_URI` not loaded | Check the file name, location and variable name (`MONGO_URI`, not `MONGODB_URI`) |
| Browser shows `ERR_CONNECTION_REFUSED` for `localhost:5000`, or the console shows 500 errors from `:5173/api/...` | Backend is not running | Start it with `npm run dev` in `backend/` and read its terminal for the real error |
| `EADDRINUSE: address already in use :::5000` | Port 5000 is taken (on macOS, AirPlay uses it) | Set `PORT=5001` in `.env` and change the proxy target in `frontend/vite.config.js` to `http://localhost:5001`, then restart both |
| Logged out immediately or after each restart | `JWT_SECRET` not set in development | Set a fixed `JWT_SECRET` |
| Login works but the next request is 401 | Cookie not being stored or sent | Use `http://localhost:5173` consistently, keep using the Vite proxy, check that browser settings do not block cookies; in production use HTTPS and the same site |
| `CORS error` | Calling the API directly from another origin | Use the Vite proxy in development, or set `CLIENT_URL` to the exact frontend origin |
| `429 Too many requests` | Rate limit hit | Wait a few minutes; repeated failed logins are limited to 30 per 15 minutes |
| `Route not found: GET /api/...` | Wrong URL or the old backend is still running | Restart the backend and check the path against section 13 |
| Validation message like "Category X does not exist for expense" | Category name does not match one of your categories | Pick a category from the dropdown; names are matched ignoring case |
| Profile picture does not appear | `/uploads` not proxied, or the image failed to upload | Restart the Vite dev server after changing `vite.config.js`; use JPG/PNG/WebP under 2 MB |
| AI results always say "Auto-generated" | No valid AI key, or the provider call failed | Set a valid `AI_API_KEY` (real keys start with `sk-ant-`); the backend logs "AI ... failed, using rule-based" with the reason |
| Charts are empty | No data in the selected period | Add transactions, or change the period |
| A date appears one day off | You compared against local time | Dates are UTC calendar days by design; pick the date you want and it is stored as that day |
| Recurring item did not create a transaction | `nextDate` is in the future | Items are created on their due date; set the start date to today to test |
| PDF shows `INR` instead of the rupee symbol | PDF fonts cannot draw the symbol | Expected; CSV and the preview use the symbol |
| `node --watch` not recognised | Node older than 18.11 | Update Node, or install `nodemon` and change the `dev` script |
| Strange install errors on Windows | Project inside OneDrive | Move the project outside OneDrive or pause syncing, delete `node_modules`, run `npm install` again |
| `npm install` warnings about vulnerabilities or deprecated packages | Normal for npm | Safe to ignore for local development; `npm audit` shows details |

When asking for help, share only the **first error line** and never your connection string, password, JWT secret or API key.

---

## 19. Manual test checklist

**Auth**
- [ ] Register with mismatched passwords shows an error; valid details log you in
- [ ] Duplicate email shows "An account with this email already exists"
- [ ] Wrong password shows "Invalid email or password"
- [ ] Refreshing the page keeps you logged in; Logout returns you to login
- [ ] Opening `/dashboard` while logged out redirects to `/login`

**Transactions**
- [ ] Add, edit and delete an expense and an income
- [ ] Search, each filter, sorting and pagination work and combine
- [ ] Empty state appears for a filter with no results

**Categories**
- [ ] Create, rename and delete a custom category; its transactions move to "Other" on delete
- [ ] "Other" cannot be renamed or deleted

**Budgets and notifications**
- [ ] Budget of 1,000 for Food; expenses of 760, 140 and 110 trigger the 75%, 90% and exceeded alerts
- [ ] Editing the budget amount clears and re-evaluates alerts
- [ ] Turning "Budget alerts" off in Settings stops new budget notifications

**Recurring**
- [ ] A monthly item starting today creates a transaction immediately
- [ ] Pause, resume, edit and delete work

**Analytics and reports**
- [ ] Monthly, yearly and custom range change all charts
- [ ] Every report type previews; CSV opens in Excel; PDF downloads

**AI**
- [ ] `I spent 500 on dinner yesterday` pre-fills Expense, 500, Food, Dinner, yesterday
- [ ] `Received salary 50000 today` pre-fills Income, Salary
- [ ] Text without a number shows a helpful error
- [ ] Insights panel shows a label and disclaimer

**UI**
- [ ] Dark mode persists after refresh
- [ ] Mobile width (about 380 px): drawer menu, stacked table cards, no horizontal page scroll

---

## 20. Known limitations

- **Not yet covered by automated tests.** The code was syntax-checked and the parsing and date logic exercised, but there are no unit or integration tests in the repository yet.
- The frontend uses a relative `/api` URL, so production needs a reverse proxy or rewrites (section 17).
- Avatars are stored on local disk.
- Insights caching is in memory (single server process).
- Display currency changes do not convert stored amounts.
- Past start dates on recurring items do not back-fill earlier occurrences.
- "Current month" uses the server's UTC date.
- Notifications are in-app only (no email or push).
- Reports are capped at 5,000 transaction rows; the on-screen preview shows the first 200.
- No password reset by email, no email verification, no two-factor authentication.

---

## 21. Future improvements

Automated tests (Jest + Supertest, React Testing Library), bank and UPI statement import (CSV/PDF), receipt scanning (OCR), multi-currency conversion, shared and group expenses, savings goals, email notifications, password reset by email, refresh tokens, Docker and CI, cloud storage for avatars, Redis cache, and an Express route that serves the built frontend.

---

## 22. Git workflow and commit strategy

### First-time setup
```bash
git init
git add .
git status          # confirm .env and node_modules are NOT listed
git commit -m "chore: initial project"
```
If `.env` was ever committed: `git rm --cached backend/.env`, commit, and **rotate every secret** that was in it.

### Branches
`main` (always working), plus short-lived branches such as `feat/budgets`, `fix/login-redirect`, `docs/readme`.

### Commit messages (Conventional Commits)
`type(scope): short summary`, with types `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`.

Suggested history for this project:
```
chore: scaffold backend and frontend projects
chore(backend): config, error handling and response helpers
feat(auth): register, login, logout and JWT cookie middleware
feat(auth-ui): login and register pages with protected routes
feat(transactions): CRUD API with search, filters and pagination
feat(ui): app layout, theme tokens and transactions pages
feat(categories): default categories and category management
feat(budgets): monthly budgets with progress and alerts
feat(notifications): notification service, bell and page
feat(recurring): recurring rules, scheduler and lazy sync
feat(analytics): aggregation endpoints and charts
feat(dashboard): summary cards and dashboard sections
feat(ai): provider layer, natural-language entry, categorisation
feat(ai): insights and saving suggestions with rule-based fallback
feat(reports): report preview, CSV and PDF export
feat(profile): profile, avatar upload and settings
fix(...): bug fixes
docs: README and API documentation
```
Keep each commit small and focused, and never commit `.env`, `node_modules`, `uploads/` or `dist/`.

---

*Built as a portfolio project: React, Node.js, Express, MongoDB, JWT authentication, REST design, aggregation pipelines, validation, security hardening, charts, reports and AI integration.*
