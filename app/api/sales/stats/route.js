import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const totalInvoices = await query('SELECT COUNT(*) FROM sales_invoices');
    const totalRevenue = await query('SELECT COALESCE(SUM(total), 0) FROM sales_invoices');
    const pendingInvoices = await query("SELECT COUNT(*) FROM sales_invoices WHERE status = 'sent'");
    const customers = await query('SELECT COUNT(*) FROM customers');
    
    return NextResponse.json({
      totalInvoices: parseInt(totalInvoices.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].coalesce),
      pendingInvoices: parseInt(pendingInvoices.rows[0].count),
      customers: parseInt(customers.rows[0].count)
    });
  } catch (error) {
    return NextResponse.json({
      totalInvoices: 0,
      totalRevenue: 0,
      pendingInvoices: 0,
      customers: 0
    });
  }
}