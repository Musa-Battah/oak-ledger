'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
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

  const isActive = (path) => pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          📚 <span>Oak</span> Ledger
        </Link>
        
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>
        
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/journal" className={`nav-link ${isActive('/journal') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
            Journal
          </Link>
          <Link href="/ledger" className={`nav-link ${isActive('/ledger') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
            Ledger
          </Link>
          <Link href="/reports/trial-balance" className={`nav-link ${isActive('/reports/trial-balance') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
            Trial Balance
          </Link>
          <Link href="/accounts" className={`nav-link ${isActive('/accounts') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
            Chart of Accounts
          </Link>
          {user ? (
            <>
              <span className="user-name">👋 {user.name}</span>
              <button onClick={handleLogout} className="logout-btn nav-link">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link href="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}