'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
    setIsMenuOpen(false);
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo" onClick={closeDropdown}>
          🌳 <span>Oak</span> Ledger
        </Link>
        
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>
        
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          {/* Home */}
          <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={closeDropdown}>
            Home
          </Link>
          
          {/* Sales Dropdown */}
          <div className="dropdown">
            <button 
              className={`dropdown-toggle ${openDropdown === 'sales' ? 'active' : ''}`}
              onClick={() => toggleDropdown('sales')}
            >
              Sales ▼
            </button>
            {openDropdown === 'sales' && (
              <div className="dropdown-menu">
                <Link href="/sales/overview" className="dropdown-item" onClick={closeDropdown}>
                  Overview
                </Link>
                <Link href="/sales/invoices" className="dropdown-item" onClick={closeDropdown}>
                  Invoices
                </Link>
                <Link href="/sales/products" className="dropdown-item" onClick={closeDropdown}>
                  Products & Services
                </Link>
                <Link href="/sales/customers" className="dropdown-item" onClick={closeDropdown}>
                  Customers
                </Link>
                <Link href="/sales/settings" className="dropdown-item" onClick={closeDropdown}>
                  Sales Settings
                </Link>
              </div>
            )}
          </div>
          
          {/* Purchases Dropdown */}
          <div className="dropdown">
            <button 
              className={`dropdown-toggle ${openDropdown === 'purchases' ? 'active' : ''}`}
              onClick={() => toggleDropdown('purchases')}
            >
              Purchases ▼
            </button>
            {openDropdown === 'purchases' && (
              <div className="dropdown-menu">
                <Link href="/purchases/overview" className="dropdown-item" onClick={closeDropdown}>
                  Overview
                </Link>
                <Link href="/purchases/bills" className="dropdown-item" onClick={closeDropdown}>
                  Bills
                </Link>
                <Link href="/purchases/orders" className="dropdown-item" onClick={closeDropdown}>
                  Purchase Orders
                </Link>
                <Link href="/purchases/expenses" className="dropdown-item" onClick={closeDropdown}>
                  Expenses
                </Link>
                <Link href="/purchases/suppliers" className="dropdown-item" onClick={closeDropdown}>
                  Suppliers
                </Link>
                <Link href="/purchases/settings" className="dropdown-item" onClick={closeDropdown}>
                  Purchases Settings
                </Link>
              </div>
            )}
          </div>
          
          {/* Reports Dropdown */}
          <div className="dropdown">
            <button 
              className={`dropdown-toggle ${openDropdown === 'reports' ? 'active' : ''}`}
              onClick={() => toggleDropdown('reports')}
            >
              Reports ▼
            </button>
            {openDropdown === 'reports' && (
              <div className="dropdown-menu">
                <Link href="/reports/profit-loss" className="dropdown-item" onClick={closeDropdown}>
                  Profit & Loss
                </Link>
                <Link href="/reports/balance-sheet" className="dropdown-item" onClick={closeDropdown}>
                  Balance Sheet
                </Link>
                <Link href="/reports/cashflow" className="dropdown-item" onClick={closeDropdown}>
                  Cash Flow
                </Link>
                <Link href="/reports/tax" className="dropdown-item" onClick={closeDropdown}>
                  Tax Report
                </Link>
                <div className="dropdown-divider"></div>
                <Link href="/accounts" className="dropdown-item" onClick={closeDropdown}>
                  Chart of Accounts
                </Link>
                <Link href="/journal" className="dropdown-item" onClick={closeDropdown}>
                  Journal Entries
                </Link>
                <Link href="/settings/accounting" className="dropdown-item" onClick={closeDropdown}>
                  Accounting Settings
                </Link>
              </div>
            )}
          </div>
          
          {user ? (
            <>
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link" onClick={closeDropdown}>Sign in</Link>
              <Link href="/register" className="nav-link" onClick={closeDropdown}>Create account</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}