'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error:', err);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeClass = (type) => {
    switch(type) {
      case 'asset': return 'text-asset';
      case 'liability': return 'text-liability';
      case 'equity': return 'text-equity';
      case 'revenue': return 'text-revenue';
      case 'expense': return 'text-expense';
      default: return '';
    }
  };

  if (loading) return <div className="loading">Loading chart of accounts...</div>;

  return (
    <div>
      <h1>Chart of Accounts</h1>
      
      {accounts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">No accounts yet</div>
          <div className="empty-state-text">Add your first account</div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Account #</th>
                  <th>Account Name</th>
                  <th>Type</th>
                  <th>Normal Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(account => (
                  <tr key={account.id}>
                    <td style={{ fontFamily: 'monospace' }}>{account.account_number}</td>
                    <td className={getAccountTypeClass(account.account_type)}>{account.account_name}</td>
                    <td className={getAccountTypeClass(account.account_type)}>{account.account_type}</td>
                    <td>{account.normal_balance}</td>
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