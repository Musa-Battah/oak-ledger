import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM products 
      WHERE is_active = true 
      ORDER BY name
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, description, price, sku } = await request.json();
    const result = await query(`
      INSERT INTO products (name, description, price, sku)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, description, price, sku]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}