'use client';

import { useState, useEffect } from 'react';

export default function TaxReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await fetch('/api/reports/tax');
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

  if (loading) return <div className="loading">Loading tax report...</div>;

  return (
    <div>
      <h1>Tax Report</h1>
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tax Type</th>
                <th>Rate</th>
                <th>Taxable Amount</th>
                <th>Tax Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>VAT (Sales)</td>
                <td>7.5%</td>
                <td>{formatNaira(report?.sales_taxable || 0)}</td>
                <td>{formatNaira(report?.sales_tax || 0)}</td>
              </tr>
              <tr>
                <td>VAT (Purchases)</td>
                <td>7.5%</td>
                <td>{formatNaira(report?.purchase_taxable || 0)}</td>
                <td>{formatNaira(report?.purchase_tax || 0)}</td>
              </tr>
              <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 'bold' }}>
                <td colSpan="3">Net VAT Payable</td>
                <td>{formatNaira(report?.net_vat || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}