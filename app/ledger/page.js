'use client';

import { useState, useEffect } from 'react';

export default function LedgerPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/ledger');
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async (accountId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ledger?accountId=${accountId}`);
      const data = await res.json();
      setSelectedAccount(data.account);
      setTransactions(data.transactions);
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

  if (loading && accounts.length === 0) {
    return <div className="loading">Loading ledger...</div>;
  }

  return (
    <div>
      <h1>General Ledger</h1>
      
      <div className="card">
        <h2>Chart of Accounts</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Account #</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr key={account.id}>
                  <td>{account.account_number}</td>
                  <td className={getAccountTypeClass(account.account_type)}>
                    {account.account_name}
                  </td>
                  <td>{account.account_type}</td>
                  <td className={account.current_balance > 0 ? 'amount-positive' : 'amount-negative'}>
                    {formatNaira(Math.abs(account.current_balance))}
                    {account.current_balance > 0 ? ' Dr' : ' Cr'}
                  </td>
                  <td>
                    <button 
                      onClick={() => fetchLedger(account.id)}
                      className="btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '12px' }}
                    >
                      View Ledger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedAccount && transactions.length > 0 && (
        <div className="card">
          <h2>{selectedAccount.account_name} Ledger</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Entry #</th>
                  <th>Description</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                    <td>{tx.entry_number}</td>
                    <td>{tx.journal_description}</td>
                    <td>{tx.debit_amount > 0 ? formatNaira(tx.debit_amount) : '-'}</td>
                    <td>{tx.credit_amount > 0 ? formatNaira(tx.credit_amount) : '-'}</td>
                    <td className={tx.running_balance > 0 ? 'amount-positive' : 'amount-negative'}>
                      {formatNaira(Math.abs(tx.running_balance))}
                      {tx.running_balance > 0 ? ' Dr' : ' Cr'}
                    </td>
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