
# Stock Market Website — Database Schema

## Project Overview

This schema represents the database for a stock market simulation website
built with HTML, CSS, JavaScript, Node.js, Express, and PostgreSQL
hosted on Neon.

The website allows users to view stock information, manage a watchlist,
track portfolio holdings, and simulate buying and selling stocks.

## Database Tables

- **users** — Stores user accounts, roles, and cash balances.
- **stocks** — Stores company names, ticker symbols, and stock prices.
- **portfolio_holdings** — Tracks the shares owned by each user.
- **transactions** — Records simulated stock purchases and sales.
- **watchlist** — Stores stocks saved by users.
- **stock_price_history** — Records stock prices over time.
- **market_settings** — Stores market opening and closing times.
- **market_holidays** — Stores market holiday dates and descriptions.
- **trading_days** — Identifies which days are trading days.

## Key Relationships

- A user can have multiple portfolio holdings.
- A stock can appear in multiple users' portfolio holdings.
- A user can make multiple transactions.
- A stock can be involved in multiple transactions.
- Users can save stocks to their watchlists.
- A stock can appear in multiple watchlists.
- A stock can have multiple historical price records.

## Diagram

The entity-relationship diagram below illustrates the database
tables and their relationships.

```mermaid
erDiagram
    USERS ||--o{ PORTFOLIO_HOLDINGS : owns
    STOCKS ||--o{ PORTFOLIO_HOLDINGS : held_as

    USERS ||--o{ TRANSACTIONS : makes
    STOCKS ||--o{ TRANSACTIONS : traded_in

    USERS ||--o{ WATCHLIST : creates
    STOCKS ||--o{ WATCHLIST : saved_in

    STOCKS ||--o{ STOCK_PRICE_HISTORY : records

    USERS {
        int user_id PK
        string full_name
        string username UK
        string email UK
        string password_hash
        string role
        decimal cash_balance
        timestamp created_at
    }

    STOCKS {
        int stock_id PK
        string company
        string ticker UK
        decimal initial_price
        decimal current_price
        bigint volume
        decimal opening_price
        decimal daily_high
        decimal daily_low
    }

    PORTFOLIO_HOLDINGS {
        int holding_id PK
        int user_id FK
        int stock_id FK
        int shares_owned
    }

    TRANSACTIONS {
        int transaction_id PK
        int user_id FK
        int stock_id FK
        string transaction_type
        int shares
        decimal price_per_share
        decimal total_amount
        timestamp transaction_date
    }

    WATCHLIST {
        int watchlist_id PK
        int user_id FK
        int stock_id FK
        timestamp added_at
    }

    STOCK_PRICE_HISTORY {
        int price_history_id PK
        int stock_id FK
        decimal price
        timestamp recorded_at
    }

    MARKET_SETTINGS {
        int setting_id PK
        time opening_time
        time closing_time
    }

    MARKET_HOLIDAYS {
        int holiday_id PK
        date holiday_date UK
        string description
    }

    TRADING_DAYS {
        int trading_day_id PK
        string day_name UK
        boolean is_trading_day
    }

```
