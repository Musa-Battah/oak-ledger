import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT si.*, c.name as customer_name 
      FROM sales_invoices si
      JOIN customers c ON si.customer_id = c.id
      ORDER BY si.date DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}