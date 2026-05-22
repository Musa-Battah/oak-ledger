# 🌳 Oak Ledger

A professional double-entry bookkeeping system built with Next.js, featuring chart of accounts, journal entries, general ledger, and trial balance reports.

## 🚀 Live Demo

[View Live Demo](https://oak-ledger.vercel.app)

## ✨ Features

### Core Accounting Features
- **Chart of Accounts** - Manage your account hierarchy with proper numbering
- **Journal Entries** - Record transactions with debit/credit validation
- **General Ledger** - View all accounts with running balances
- **Trial Balance** - Verify ledger integrity at any date
- **Financial Dashboard** - Key metrics and recent activity

### Technical Features
- Double-entry validation (debits must equal credits)
- PostgreSQL database with relational schema
- JWT authentication with HTTP-only cookies
- Responsive dark theme design
- Mobile-friendly interface

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 16 (App Router) |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL (Neon) |
| **Authentication** | JWT + HTTP-only Cookies |
| **Styling** | Custom CSS (Inter font) |
| **Deployment** | Vercel |

## 📊 Database Schema

```sql
-- Chart of Accounts
CREATE TABLE chart_of_accounts (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    normal_balance VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal Entries
CREATE TABLE journal_entries (
    id SERIAL PRIMARY KEY,
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'posted',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal Entry Lines
CREATE TABLE journal_entry_lines (
    id SERIAL PRIMARY KEY,
    journal_entry_id INTEGER REFERENCES journal_entries(id),
    account_id INTEGER REFERENCES chart_of_accounts(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT
);

-- General Ledger (audit trail)
CREATE TABLE general_ledger (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES chart_of_accounts(id),
    transaction_date DATE NOT NULL,
    journal_entry_id INTEGER REFERENCES journal_entries(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    running_balance DECIMAL(15,2) NOT NULL
);

# Database (Neon)
PGHOST=your_neon_host
PGPORT=5432
PGDATABASE=neondb
PGUSER=your_user
PGPASSWORD=your_password
PGSSLMODE=require

# JWT Authentication
JWT_SECRET=your_super_secret_key

# App URL
NEXTAUTH_URL=http://localhost:3000

Database Setup
Create a database on Neon.tech

Run the schema SQL in the Neon SQL Editor

Insert default chart of accounts:
INSERT INTO chart_of_accounts (account_number, account_name, account_type, normal_balance) VALUES
    ('1-1100', 'Cash', 'asset', 'debit'),
    ('1-1200', 'Accounts Receivable', 'asset', 'debit'),
    ('2-2100', 'Accounts Payable', 'liability', 'credit'),
    ('3-3100', 'Owner''s Capital', 'equity', 'credit'),
    ('4-4100', 'Sales Revenue', 'revenue', 'credit'),
    ('5-5100', 'Rent Expense', 'expense', 'debit'),
    ('5-5200', 'Salary Expense', 'expense', 'debit');

    