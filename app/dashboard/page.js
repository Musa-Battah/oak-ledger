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
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [statsRes, entriesRes] = await Promise.all([
        fetch('/api/reports/dashboard'),
        fetch('/api/journal/entries?limit=5')
      ]);
      
      const statsData = await statsRes.json();
      const entriesData = await entriesRes.json();
      
      setStats(statsData);
      setRecentEntries(entriesData);
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
        <Link href="/journal/new" className="action-card">
          <h3>📝 New Entry</h3>
          <p>Record transaction</p>
        </Link>
        <Link href="/reports/trial-balance" className="action-card">
          <h3>📊 Trial Balance</h3>
          <p>Verify ledger</p>
        </Link>
        <Link href="/ledger" className="action-card">
          <h3>📒 General Ledger</h3>
          <p>View accounts</p>
        </Link>
        <Link href="/accounts" className="action-card">
          <h3>🏷️ Chart of Accounts</h3>
          <p>Manage accounts</p>
        </Link>
      </div>
      
      {recentEntries.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Journal Entries</span>
            <Link href="/journal" className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
              View All
            </Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Entry #</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map(entry => (
                  <tr key={entry.id}>
                    <td style={{ fontFamily: 'monospace' }}>{entry.entry_number}</td>
                    <td>{new Date(entry.entry_date).toLocaleDateString()}</td>
                    <td>{entry.description}</td>
                    <td>{formatNaira(entry.total_debit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}