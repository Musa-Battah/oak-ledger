'use client';

import { useState, useEffect } from 'react';

export default function TrialBalancePage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReport();
  }, [asOfDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/trial-balance?date=${asOfDate}`);
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

  if (loading) {
    return <div className="loading">Loading trial balance...</div>;
  }

  return (
    <div>
      <h1>Trial Balance</h1>
      
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>As of Date</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
            />
          </div>
          <button onClick={fetchReport} className="btn-secondary" style={{ marginTop: '24px' }}>
            Refresh
          </button>
        </div>
      </div>
      
      <div className="card">
        <h2>Trial Balance as at {new Date(report.as_of_date).toLocaleDateString()}</h2>
        
        <div className="table-container">
          <table className="trial-balance-table">
            <thead>
              <tr>
                <th>Account #</th>
                <th>Account Name</th>
                <th>Account Type</th>
                <th>Debit (₦)</th>
                <th>Credit (₦)</th>
              </tr>
            </thead>
            <tbody>
              {report.accounts.map(account => (
                <tr key={account.account_number}>
                  <td>{account.account_number}</td>
                  <td>{account.account_name}</td>
                  <td>{account.account_type}</td>
                  <td className={account.balance > 0 ? 'amount-positive' : ''}>
                    {account.balance > 0 ? formatNaira(account.balance) : '-'}
                  </td>
                  <td className={account.balance < 0 ? 'amount-negative' : ''}>
                    {account.balance < 0 ? formatNaira(Math.abs(account.balance)) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan="3"><strong>Totals</strong></td>
                <td><strong>{formatNaira(report.totals.debits)}</strong></td>
                <td><strong>{formatNaira(report.totals.credits)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          {report.totals.is_balanced ? (
            <div className="balanced">✓ Trial balance is balanced. Debits equal Credits.</div>
          ) : (
            <div className="unbalanced">✗ Trial balance is unbalanced. Difference: {formatNaira(report.totals.difference)}</div>
          )}
        </div>
      </div>
    </div>
  );
}