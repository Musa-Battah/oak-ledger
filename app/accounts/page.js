'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      setAccounts(data);
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

  const getAccountTypeClass = (type) => {
    switch(type) {
      case 'asset': return 'account-asset';
      case 'liability': return 'account-liability';
      case 'equity': return 'account-equity';
      case 'revenue': return 'account-revenue';
      case 'expense': return 'account-expense';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading chart of accounts...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Chart of Accounts</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + Add Account
        </button>
      </div>
      
      {showForm && (
        <div className="card">
          <h2>Add New Account</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const res = await fetch('/api/accounts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                account_number: formData.get('account_number'),
                account_name: formData.get('account_name'),
                account_type: formData.get('account_type'),
                normal_balance: formData.get('normal_balance')
              })
            });
            if (res.ok) {
              setShowForm(false);
              fetchAccounts();
            }
          }}>
            <div className="form-group">
              <label>Account Number</label>
              <input name="account_number" placeholder="e.g., 1-1600" required />
            </div>
            <div className="form-group">
              <label>Account Name</label>
              <input name="account_name" placeholder="e.g., Office Equipment" required />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select name="account_type" required>
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="form-group">
              <label>Normal Balance</label>
              <select name="normal_balance" required>
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary">Create Account</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}
      
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
                  <td>{account.account_number}</td>
                  <td className={getAccountTypeClass(account.account_type)}>{account.account_name}</td>
                  <td>{account.account_type}</td>
                  <td>{account.normal_balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}