import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT si.*, c.name as customer_name 
      FROM sales_invoices si
      LEFT JOIN customers c ON si.customer_id = c.id
      ORDER BY si.date DESC
      LIMIT 50
    `);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json([]);
  }
}