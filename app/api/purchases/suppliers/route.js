import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT s.*, COUNT(pb.id) as bill_count 
      FROM suppliers s
      LEFT JOIN purchase_bills pb ON s.id = pb.supplier_id
      GROUP BY s.id
      ORDER BY s.name
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
      INSERT INTO suppliers (name, email, phone, address)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, email, phone, address]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}