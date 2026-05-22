'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Q: Why use state for lines array?
// A: Journal entries can have multiple debit/credit lines

export default function JournalEntryForm() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([
    { account_id: '', debit_amount: '', credit_amount: '', description: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const res = await fetch('/api/accounts');
    const data = await res.json();
    setAccounts(data);
  };

  const addLine = () => {
    setLines([...lines, { account_id: '', debit_amount: '', credit_amount: '', description: '' }]);
  };

  const removeLine = (index) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index, field, value) => {
    const updatedLines = [...lines];
    updatedLines[index][field] = value;
    
    // Q: Why clear the opposite amount?
    // A: A line cannot be both a debit AND a credit
    if (field === 'debit_amount') {
      updatedLines[index].credit_amount = '';
    }
    if (field === 'credit_amount') {
      updatedLines[index].debit_amount = '';
    }
    
    setLines(updatedLines);
  };

  const calculateTotals = () => {
    let totalDebits = 0;
    let totalCredits = 0;
    
    lines.forEach(line => {
      totalDebits += parseFloat(line.debit_amount) || 0;
      totalCredits += parseFloat(line.credit_amount) || 0;
    });
    
    return { totalDebits, totalCredits, isBalanced: totalDebits === totalCredits };
  };

  const { totalDebits, totalCredits, isBalanced } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isBalanced) {
      setError('Journal entry does not balance. Debits must equal Credits.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_date: entryDate,
          description,
          lines: lines.filter(line => line.account_id)
        })
      });
      
      if (res.ok) {
        router.push('/journal');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create journal entry');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div>
      <h1>New Journal Entry</h1>
      
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Entry Date</label>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this transaction for?"
            required
          />
        </div>
        
        <div className="table-container">
          <table className="journal-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Debit (₦)</th>
                <th>Credit (₦)</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx}>
                  <td>
                    <select
                      value={line.account_id}
                      onChange={(e) => updateLine(idx, 'account_id', e.target.value)}
                      required
                    >
                      <option value="">Select Account</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.account_number} - {acc.account_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={line.debit_amount}
                      onChange={(e) => updateLine(idx, 'debit_amount', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={line.credit_amount}
                      onChange={(e) => updateLine(idx, 'credit_amount', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(idx, 'description', e.target.value)}
                      placeholder="Line description (optional)"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="btn-danger"
                      disabled={lines.length === 1}
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td><strong>Totals</strong></td>
                <td><strong>{formatNaira(totalDebits)}</strong></td>
                <td><strong>{formatNaira(totalCredits)}</strong></td>
                <td colSpan="2">
                  {isBalanced ? (
                    <span style={{ color: '#10b981' }}>✓ Balanced</span>
                  ) : (
                    <span style={{ color: '#ef4444' }}>⚠ Not Balanced (Difference: {formatNaira(Math.abs(totalDebits - totalCredits))})</span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <button type="button" onClick={addLine} className="btn-secondary">
          + Add Line
        </button>
        
        {error && <div className="error-message">{error}</div>}
        
        <div style={{ marginTop: '20px' }}>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Journal Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}