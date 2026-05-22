import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT c.*, COUNT(si.id) as invoice_count 
      FROM customers c
      LEFT JOIN sales_invoices si ON c.id = si.customer_id
      GROUP BY c.id
      ORDER BY c.name
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, email, phone, address } = await request.json();
    const result = await query(`
      INSERT INTO customers (name, email, phone, address)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, email, phone, address]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}