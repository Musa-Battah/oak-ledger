import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT c.id, c.business_name as name, c.business_type, c.phone, c.address, c.city, c.state, c.created_at,
             COUNT(si.id) as invoice_count,
             COALESCE(SUM(si.total), 0) as total_spent
      FROM customers c
      LEFT JOIN sales_invoices si ON c.id = si.customer_id
      GROUP BY c.id
      ORDER BY c.business_name
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
    const { name, email, phone, address, city, state, business_type } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }
    
    const result = await query(`
      INSERT INTO customers (business_name, business_type, phone, address, city, state)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, business_name as name, business_type, phone, address, city, state
    `, [name.trim(), business_type || 'individual', phone || null, address || null, city || null, state || null]);
    
    const newCustomer = result.rows[0];
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}