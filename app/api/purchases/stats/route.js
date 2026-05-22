import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const totalBills = await query('SELECT COUNT(*) FROM purchase_bills');
    const totalPurchases = await query('SELECT COALESCE(SUM(total), 0) FROM purchase_bills');
    const suppliers = await query('SELECT COUNT(*) FROM suppliers');
    
    return NextResponse.json({
      totalBills: parseInt(totalBills.rows[0].count),
      totalPurchases: parseFloat(totalPurchases.rows[0].coalesce),
      suppliers: parseInt(suppliers.rows[0].count)
    });
  } catch (error) {
    return NextResponse.json({
      totalBills: 0,
      totalPurchases: 0,
      suppliers: 0
    });
  }
}