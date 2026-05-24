import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT s.id, s.name, s.email, s.phone, s.address, s.created_at,
             COUNT(pb.id) as bill_count,
             COALESCE(SUM(pb.total), 0) as total_purchased
      FROM suppliers s
      LEFT JOIN purchase_bills pb ON s.id = pb.supplier_id
      GROUP BY s.id
      ORDER BY s.name
    `);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, address } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 });
    }
    
    const result = await query(`
      INSERT INTO suppliers (name, email, phone, address)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, phone, address
    `, [name.trim(), email || null, phone || null, address || null]);
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}