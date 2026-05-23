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
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    // Only name is required, all other fields are optional
    const { name, email, phone, address } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }
    
    const result = await query(`
      INSERT INTO customers (name, email, phone, address)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name.trim(), email || null, phone || null, address || null]);
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}