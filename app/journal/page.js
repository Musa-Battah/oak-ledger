'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/journal/entries');
      const data = await res.json();
      setEntries(data);
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

  if (loading) return <div className="loading">Loading journal entries...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Journal Entries</h1>
        <Link href="/journal/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          + New Entry
        </Link>
      </div>
      
      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No Journal Entries</div>
          <div className="empty-state-text">Create your first journal entry to get started</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="journal-table">
            <thead>
              <tr>
                <th>Entry #</th>
                <th>Date</th>
                <th>Description</th>
                <th>Total Debit</th>
                <th>Total Credit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.entry_number}</td>
                  <td>{new Date(entry.entry_date).toLocaleDateString()}</td>
                  <td>{entry.description}</td>
                  <td>{formatNaira(entry.total_debit)}</td>
                  <td>{formatNaira(entry.total_credit)}</td>
                  <td>
                    <span className={`status-${entry.status}`}>
                      {entry.status}
                    </span>
                  </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}