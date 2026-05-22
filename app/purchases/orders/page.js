'use client';

import Link from 'next/link';

export default function PurchaseOrdersPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Purchase Orders</h1>
        <Link href="/purchases/orders/new" className="btn-primary">
          + New Order
        </Link>
      </div>
      <div className="card">
        <p>Purchase orders feature coming soon.</p>
        <p style={{ color: '#888', marginTop: '10px' }}>Track orders placed with suppliers.</p>
      </div>
    </div>
  );
}