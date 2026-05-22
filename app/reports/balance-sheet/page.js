'use client';

import { useState, useEffect } from 'react';

export default function BalanceSheetPage() {
  const [report, setReport] = useState(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [asOfDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/balance-sheet?date=${asOfDate}`);
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

  if (loading) return <div className="loading">Loading balance sheet...</div>;

  return (
    <div>
      <h1>Balance Sheet</h1>
      
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>As of Date</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
            />
          </div>
          <button onClick={fetchReport} className="btn-secondary">Refresh</button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h2>Assets</h2>
          {report?.assets.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No assets</p>
          ) : (
            <div className="table-container">
              <table>
                <tbody>
                  {report?.assets.map(account => (
                    <tr key={account.account_number}>
                      <td>{account.account_name}</td>
                      <td className="amount-positive">{formatNaira(account.balance)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 'bold' }}>
                    <td>Total Assets</td>
                    <td>{formatNaira(report?.totals.assets)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div>
          <div className="card">
            <h2>Liabilities</h2>
            {report?.liabilities.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No liabilities</p>
            ) : (
              <div className="table-container">
                <table>
                  <tbody>
                    {report?.liabilities.map(account => (
                      <tr key={account.account_number}>
                        <td>{account.account_name}</td>
                        <td className="amount-negative">{formatNaira(account.balance)}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 'bold' }}>
                      <td>Total Liabilities</td>
                      <td>{formatNaira(report?.totals.liabilities)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="card">
            <h2>Equity</h2>
            {report?.equity.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No equity</p>
            ) : (
              <div className="table-container">
                <table>
                  <tbody>
                    {report?.equity.map(account => (
                      <tr key={account.account_number}>
                        <td>{account.account_name}</td>
                        <td className="amount-positive">{formatNaira(account.balance)}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 'bold' }}>
                      <td>Total Equity</td>
                      <td>{formatNaira(report?.totals.equity)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Total Liabilities + Equity</span>
              <span>{formatNaira(report?.totals.liabilities + report?.totals.equity)}</span>
            </div>
            {Math.abs(report?.totals.difference) > 0.01 && (
              <div style={{ marginTop: '16px', color: 'var(--danger)', textAlign: 'center' }}>
                ⚠ Off by: {formatNaira(report?.totals.difference)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}