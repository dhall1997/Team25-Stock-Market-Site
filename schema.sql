
-- =========================================
-- STOCK MARKET WEBSITE DATABASE SCHEMA
-- PostgreSQL / Neon
-- =========================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    cash_balance NUMERIC(12, 2) NOT NULL DEFAULT 10000.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check
        CHECK (role IN ('user', 'admin')),
    CONSTRAINT users_cash_balance_check
        CHECK (cash_balance >= 0)
);

-- 2. STOCKS
CREATE TABLE IF NOT EXISTS stocks (
    stock_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company VARCHAR(150) NOT NULL,
    ticker VARCHAR(10) NOT NULL UNIQUE,
    initial_price NUMERIC(12, 2) NOT NULL,
    current_price NUMERIC(12, 2) NOT NULL,
    volume BIGINT NOT NULL DEFAULT 0,
    opening_price NUMERIC(12, 2) NOT NULL,
    daily_high NUMERIC(12, 2) NOT NULL,
    daily_low NUMERIC(12, 2) NOT NULL,
    CONSTRAINT stocks_prices_check
        CHECK (
            initial_price >= 0 AND
            current_price >= 0 AND
            opening_price >= 0 AND
            daily_high >= 0 AND
            daily_low >= 0
        ),
    CONSTRAINT stocks_volume_check CHECK (volume >= 0)
);

-- 3. PORTFOLIO HOLDINGS
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    holding_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES users(user_id) ON DELETE CASCADE,
    stock_id INTEGER NOT NULL
        REFERENCES stocks(stock_id) ON DELETE CASCADE,
    shares_owned INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT holdings_shares_check CHECK (shares_owned >= 0),
    CONSTRAINT unique_user_stock_holding UNIQUE (user_id, stock_id)
);

-- 4. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES users(user_id) ON DELETE CASCADE,
    stock_id INTEGER NOT NULL
        REFERENCES stocks(stock_id) ON DELETE RESTRICT,
    transaction_type VARCHAR(10) NOT NULL,
    shares INTEGER NOT NULL,
    price_per_share NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT transaction_type_check
        CHECK (transaction_type IN ('buy', 'sell')),
    CONSTRAINT transaction_shares_check CHECK (shares > 0),
    CONSTRAINT transaction_price_check CHECK (price_per_share >= 0),
    CONSTRAINT transaction_total_check CHECK (total_amount >= 0)
);

-- 5. WATCHLIST
CREATE TABLE IF NOT EXISTS watchlist (
    watchlist_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES users(user_id) ON DELETE CASCADE,
    stock_id INTEGER NOT NULL
        REFERENCES stocks(stock_id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_watchlist_stock UNIQUE (user_id, stock_id)
);

-- 6. STOCK PRICE HISTORY
CREATE TABLE IF NOT EXISTS stock_price_history (
    price_history_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    stock_id INTEGER NOT NULL
        REFERENCES stocks(stock_id) ON DELETE CASCADE,
    price NUMERIC(12, 2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT history_price_check CHECK (price >= 0)
);

-- 7. MARKET SETTINGS
CREATE TABLE IF NOT EXISTS market_settings (
    setting_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL
);

-- 8. TRADING DAYS
CREATE TABLE IF NOT EXISTS trading_days (
    trading_day_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    day_name VARCHAR(10) NOT NULL UNIQUE,
    is_trading_day BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT trading_day_name_check
        CHECK (
            day_name IN (
                'Monday', 'Tuesday', 'Wednesday',
                'Thursday', 'Friday', 'Saturday', 'Sunday'
            )
        )
);

-- 9. MARKET HOLIDAYS
CREATE TABLE IF NOT EXISTS market_holidays (
    holiday_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL
);

-- Helpful indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_transactions_user_date
    ON transactions(user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_stock_date
    ON transactions(stock_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_price_history_stock_date
    ON stock_price_history(stock_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_holdings_user
    ON portfolio_holdings(user_id);

CREATE INDEX IF NOT EXISTS idx_watchlist_user
    ON watchlist(user_id);
