# Stock Market Website — Project Progress and Completed Work

## Purpose
This document tracks completed development tasks to prevent duplicated work and help team members coordinate contributions.

## 1. Database Design and Documentation
- Created `schema.md` to document the stock market website database.
- Added a project overview, database table descriptions, and key relationships.
- Created a Mermaid entity-relationship diagram based on the Neon PostgreSQL database.
- Documented the following database tables:
  - `users`
  - `stocks`
  - `portfolio_holdings`
  - `transactions`
  - `watchlist`
  - `stock_price_history`
  - `market_settings`
  - `market_holidays`
  - `trading_days`

## 2. Database Setup
- Set up a PostgreSQL database hosted on Neon.
- Connected the Node.js backend to the database using the PostgreSQL connection pool.
- Verified the database tables, columns, primary keys, unique constraints, and foreign-key relationships.

## 3. Backend Development
- Configured the Express server in `backend/server.js`.
- Implemented user login and JWT authentication.
- Implemented the `/stocks` endpoint to retrieve stock information.
- Implemented the `/buy` endpoint for simulated stock purchases.
- Implemented the `/sell` endpoint for simulated stock sales.
- Implemented the `/portfolio` endpoint to retrieve a user's holdings.
- Implemented the `/transactions` endpoint to retrieve a user's transaction history.
- Connected simulated buy and sell operations to the database so transactions and portfolio holdings persist.

## 4. Frontend Integration
- Connected `public/script.js` to the backend API.
- Integrated stock loading, buying, and selling.
- Integrated portfolio loading from the database.
- Integrated transaction history loading from the database.
- Connected the customer login flow to the dashboard.
- Added role-based redirection for administrator and regular-user login.

## 5. Testing Completed
- Tested the backend database connection.
- Tested the stock retrieval endpoint.
- Tested simulated purchases and sales.
- Tested portfolio retrieval.
- Tested transaction history retrieval.
- Confirmed that portfolio holdings and transaction history remain available after refreshing the page.

## 6. Project Files Worked On
- `schema.md` — database documentation and ER diagram.
- `backend/server.js` — backend API, authentication, and database operations.
- `public/script.js` — frontend API integration and dashboard functionality.
- `public/index.html` — main website interface.
- `public/admin.html` and `public/admin.js` — administrator interface files reviewed as part of the project structure.
- `.gitignore` — configured to exclude environment files and `node_modules` from Git tracking.

## 7. Remaining Work / Coordination
- Review the schema and verify that it matches the final database structure.
- Verify that the frontend cash balance is loaded from the database instead of relying on a hardcoded starting balance.
- Review administrator functionality and identify any remaining implementation or testing tasks.
- Coordinate with teammates before modifying completed backend routes or database tables.
- Update this document whenever additional features are completed or tested.

## Team Coordination Note
Please review this document before starting new development. If you plan to modify an existing feature, coordinate with the team first to avoid duplicating work or overwriting completed functionality.

## 8. Neon Database Access and Team Setup

### Database Owner's Completed Work
- Created the Neon PostgreSQL database for the stock market website.
- Created and verified the database tables and relationships.
- Connected Neon to the Node.js/Express backend.
- Tested stock retrieval, simulated buying and selling, portfolio holdings, and transaction history.

### Instructions for Teammates
1. Request access to the existing Neon project from the database owner.
2. Accept the invitation using your own account.
3. Obtain the appropriate project permissions for your assigned work.
4. Clone or pull the latest stock market website code from GitHub.
5. Install the project's Node.js dependencies using `npm install` from the backend folder, where `package.json` is located.
6. Create a private `.env` file inside the `backend` folder if one does not already exist.
7. Configure `DATABASE_URL` using the authorized Neon connection details.
8. Keep database credentials private. Never commit `.env` files or connection strings to GitHub.
9. Start the backend using the project's existing start command in `package.json`.
10. Test the application before making changes to shared features.

### Database Change Coordination
- Review `schema.md` before changing database tables.
- Do not recreate tables that already exist.
- Coordinate with the database owner before changing table structures, deleting records, or running database reset scripts.
- Update `schema.md` if the database structure changes.
- Document completed work in this progress note to prevent duplicated development.

### Remaining Work
- Confirm that all teammates can connect successfully.
- Verify that cash balances load from Neon rather than a hardcoded starting value.
- Review remaining administrator features.
- Continue testing the application and documenting completed features.

### Security Reminder
Database connection strings contain credentials. Share them only through an approved private method, never in source code, public GitHub files, or this progress document.

**Note:** This document records work completed so far. Items listed under remaining work still need review or completion.