'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    description: '',
    lines: [{ account_id: '', debit_amount: '', credit_amount: '', description: '' }]
  });
  const [submitting, setSubmitting] = useState(false);

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
    }
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { account_id: '', debit_amount: '', credit_amount: '', description: '' }]
    });
  };

  const removeLine = (index) => {
    if (formData.lines.length > 1) {
      setFormData({
        ...formData,
        lines: formData.lines.filter((_, i) => i !== index)
      });
    }
  };

  const updateLine = (index, field, value) => {
    const updatedLines = [...formData.lines];
    updatedLines[index][field] = value;
    
    if (field === 'debit_amount') {
      updatedLines[index].credit_amount = '';
    }
    if (field === 'credit_amount') {
      updatedLines[index].debit_amount = '';
    }
    
    setFormData({ ...formData, lines: updatedLines });
  };

  const calculateTotals = () => {
    let totalDebits = 0;
    let totalCredits = 0;
    
    formData.lines.forEach(line => {
      totalDebits += parseFloat(line.debit_amount) || 0;
      totalCredits += parseFloat(line.credit_amount) || 0;
    });
    
    return { totalDebits, totalCredits, isBalanced: totalDebits === totalCredits };
  };

  const { totalDebits, totalCredits, isBalanced } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isBalanced) {
      alert('Debits must equal Credits');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_date: formData.entry_date,
          description: formData.description,
          lines: formData.lines.filter(line => line.account_id)
        })
      });
      
      if (res.ok) {
        router.push('/journal');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create journal entry');
      }
    } catch (err) {
      alert('Network error');
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
            value={formData.entry_date}
            onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Transaction description"
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
              {formData.lines.map((line, idx) => (
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
                      placeholder="Line description"
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeLine(idx)} className="btn-danger" disabled={formData.lines.length === 1}>
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
                    <span style={{ color: '#ef4444' }}>⚠ Difference: {formatNaira(Math.abs(totalDebits - totalCredits))}</span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <button type="button" onClick={addLine} className="btn-secondary" style={{ marginTop: '10px' }}>
          + Add Line
        </button>
        
        <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '20px' }}>
          {submitting ? 'Posting...' : 'Post Journal Entry'}
        </button>
      </form>
    </div>
  );
}