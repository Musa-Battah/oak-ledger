'use client';

import { useState, useEffect } from 'react';

export default function ProfitLossPage() {
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 12);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, [startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setReport(data);
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

  if (loading) return <div className="loading">Loading report...</div>;

  return (
    <div>
      <h1>Profit & Loss Statement</h1>
      
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button onClick={fetchReport} className="btn-secondary">Refresh</button>
        </div>
      </div>
      
      <div className="card">
        <h2>Revenue</h2>
        {report?.revenue.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No revenue transactions</p>
        ) : (
          <div className="table-container">
            <table>
              <tbody>
                {report?.revenue.map(account => (
                  <tr key={account.account_number}>
                    <td>{account.account_name}</td>
                    <td className="amount-positive">{formatNaira(account.balance)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 'bold' }}>
                  <td>Total Revenue</td>
                  <td>{formatNaira(report?.totals.revenue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        <h2 style={{ marginTop: '24px' }}>Expenses</h2>
        {report?.expenses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No expense transactions</p>
        ) : (
          <div className="table-container">
            <table>
              <tbody>
                {report?.expenses.map(account => (
                  <tr key={account.account_number}>
                    <td>{account.account_name}</td>
                    <td className="amount-negative">{formatNaira(account.balance)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 'bold' }}>
                  <td>Total Expenses</td>
                  <td>{formatNaira(report?.totals.expenses)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '2px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
            <span>Net Income</span>
            <span className={report?.totals.net_income >= 0 ? 'amount-positive' : 'amount-negative'}>
              {formatNaira(report?.totals.net_income)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}