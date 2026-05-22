'use client';

import Link from 'next/link';

export default function ExpensesPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Expenses</h1>
        <Link href="/purchases/expenses/new" className="btn-primary">
          + Add Expense
        </Link>
      </div>
      <div className="card">
        <p>Expense tracking feature coming soon.</p>
        <p style={{ color: '#888', marginTop: '10px' }}>Track operating expenses and overhead costs.</p>
      </div>
    </div>
  );
}