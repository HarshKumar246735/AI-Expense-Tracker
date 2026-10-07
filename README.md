# AI Expense Tracker
<img width="1911" height="915" alt="Screenshot 2026-10-07 173726" src="https://github.com/user-attachments/assets/50fcecb5-54a0-44d3-84ee-1c71717fdb9c" />


A full-stack personal finance app: record income and expenses, set budgets, schedule recurring payments, see analytics, export reports, and let AI help you enter and understand your spending.

<img width="1915" height="922" alt="Screenshot 2026-10-07 173941" src="https://github.com/user-attachments/assets/11eae962-0f7a-4435-98d6-91800f36033e" />


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

<img width="1911" height="915" alt="Screenshot 2026-10-07 173726" src="https://github.com/user-attachments/assets/6ea093b6-eb9e-4539-8e8d-29c74b5c8291" />

- Register with name, email, password and confirm password; log in with email and password; log out.
- Passwords are hashed with bcrypt. Sessions use a JWT stored in an **httpOnly cookie** (JavaScript in the page cannot read it).
- Protected routes on both the API and the frontend. Visiting a protected page while logged out redirects to the login page and returns you to where you were after login.
- Each user can only ever see and change their own data.

### Transactions

<img width="1887" height="917" alt="image" src="https://github.com/user-attachments/assets/576e31e9-2fa4-4532-943b-315c5b601a32" />

- Income and expense records with: type, amount, category, date, description, payment method, notes.
- Create, view, edit and delete, with validation on both the frontend and the backend.
- Transaction history table with **search** (description, notes, category), **filters** (type, category, payment method, date range, amount range), **sorting** (date, amount, category), and **pagination** (10 per page).
- Totals for the current filter (income and expenses) shown above the table.
- Loading skeletons, empty states, and a confirmation dialog before deleting.
- On small screens the table turns into stacked cards.

### Categories

<img width="1891" height="910" alt="image" src="https://github.com/user-attachments/assets/aa8f910f-c094-4017-96cb-3b3aedf766d4" />

- Default **expense** categories: Food, Shopping, Transport, Rent, Bills, Health, Education, Entertainment, Travel, Other.
- Default **income** categories: Salary, Freelance, Business, Investment, Gift, Other.
- Create, rename, recolor and delete your own categories. Renaming updates all transactions, budgets and recurring items that use it. Deleting moves its transactions to "Other".

### Budgets

<img width="1917" height="917" alt="image" src="https://github.com/user-attachments/assets/41a8dd21-16d4-4c16-a892-96f455d36c9c" />

- Monthly budget per expense category (for example Food: 7,000 for October 2026).
- Shows budget amount, amount spent, remaining, percentage used and a colour-coded progress bar.
- Warnings at **75%**, **90%** and when **exceeded**, shown on the card and as notifications.
- Invalid values (zero, negative, non-numeric, duplicates for the same category and month) are rejected.

### Recurring transactions

<img width="1912" height="915" alt="image" src="https://github.com/user-attachments/assets/b081e466-178e-4f4b-8e9a-d5cb440f4902" />

- Rent, salary, subscriptions, EMIs, internet, electricity, insurance, or anything else.
- Fields: name, amount, category, type, frequency (daily, weekly, monthly, yearly), start date, next date, end date.
- Due occurrences are created automatically (by a daily scheduler and also when you use the app).
- Pause and resume, edit, delete. Upcoming ones appear on the dashboard.

### Analytics

<img width="1910" height="917" alt="image" src="https://github.com/user-attachments/assets/68171c4b-1f6d-493c-b367-7ee8826ccdd5" />

- Income vs expenses, expenses by category, monthly spending trend, daily spending, payment-method distribution, savings trend.
- **Monthly**, **yearly** and **custom date range** views.
- Plain-language summaries, for example "Your expenses increased by 18% compared with last month."

### Reports

<img width="1917" height="922" alt="image" src="https://github.com/user-attachments/assets/3ad29e85-734d-4431-860a-921d8870137f" />

- Monthly, yearly, category, income and expense reports.
- On-screen preview, then export to **CSV** or **PDF**.

### Notifications

<img width="1906" height="917" alt="image" src="https://github.com/user-attachments/assets/791c4c1f-6f36-455b-8267-89d930f56e8b" />

- Budget approaching its limit (75% and 90%), budget exceeded, upcoming recurring payment, unusually large expense, and a monthly summary.
- Bell icon with an unread count in the top bar; full list page with mark-as-read, mark-all-as-read and delete.
- Each alert type can be switched off in Settings.

### Profile and settings

<img width="1917" height="925" alt="image" src="https://github.com/user-attachments/assets/24d67660-b43e-4579-8002-a33d7f778c76" />

- Profile: name, email, profile picture, currency, monthly income.
- Settings: currency, light/dark theme, notification preferences, change password.

### AI features
- **Natural-language entry:** type "I spent 500 on dinner yesterday" and the form is pre-filled for you to confirm.
- **Automatic categorisation:** suggest a category from the description; you can change it before saving.
- **Spending insights:** highest category, month-over-month change, unusual spending, savings rate.
- **Saving suggestions:** practical, data-based budgeting tips.
- AI output is clearly labelled. Without an API key, built-in rules are used instead.

### UI and experience

<img width="1908" height="912" alt="Screenshot 2026-10-07 173955" src="https://github.com/user-attachments/assets/4abf1fdf-ab2d-4938-a8eb-845847724a50" />

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
│   │       ├── Provider.js        <- Anthropic API call
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
| MongoDB | Atlas free cluster 


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
Open `backend/.env` and fill in `MONGO_URI` and `JWT_SECRET`  Generate a secret with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Step 3: install the frontend
```bash
cd ../frontend
npm install
```

### Step 4: make sure MongoDB is reachable
 For Atlas, the most common problem is forgetting to allow your IP address.

### Step 5: run both servers
Open **two terminals**

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

