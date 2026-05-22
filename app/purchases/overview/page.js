'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PurchasesOverview() {
  const [stats, setStats] = useState({
    totalBills: 0,
    totalPurchases: 0,
    suppliers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/purchases/stats');
      const data = await res.json();
      setStats(data);
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1>Purchases Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Bills</div>
          <div className="stat-value">{stats.totalBills}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Purchases</div>
          <div className="stat-value">{formatNaira(stats.totalPurchases)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Suppliers</div>
          <div className="stat-value">{stats.suppliers}</div>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <Link href="/purchases/bills/new" className="action-card">
          <h3>📄 New Bill</h3>
          <p>Record purchase</p>
        </Link>
        <Link href="/purchases/suppliers/new" className="action-card">
          <h3>🏭 Add Supplier</h3>
          <p>Register new supplier</p>
        </Link>
      </div>
    </div>
  );
}