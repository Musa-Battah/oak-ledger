'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalDebits: 0,
    totalCredits: 0,
    isBalanced: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const statsRes = await fetch('/api/reports/dashboard');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <div className="loading">Loading dashboard</div>;

  return (
    <div>
      <h1>Financial Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Journal Entries</div>
          <div className="stat-value">{stats.totalEntries}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Debits</div>
          <div className="stat-value">{formatNaira(stats.totalDebits)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Credits</div>
          <div className="stat-value">{formatNaira(stats.totalCredits)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ledger Status</div>
          <div className="stat-value" style={{ color: stats.isBalanced ? '#10b981' : '#ef4444' }}>
            {stats.isBalanced ? 'In Balance' : 'Out of Balance'}
          </div>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <Link href="/sales/invoices/new" className="action-card">
          <h3>📝 New Invoice</h3>
          <p>Create sales invoice</p>
        </Link>
        <Link href="/purchases/bills/new" className="action-card">
          <h3>📄 New Bill</h3>
          <p>Record purchase</p>
        </Link>
        <Link href="/reports/trial-balance" className="action-card">
          <h3>📊 Trial Balance</h3>
          <p>Verify ledger</p>
        </Link>
      </div>
    </div>
  );
}