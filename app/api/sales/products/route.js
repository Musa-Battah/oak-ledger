import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM products 
      WHERE is_active = true 
      ORDER BY name
    `);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const { name, description, price, sku } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    
    const result = await query(`
      INSERT INTO products (name, description, price, sku)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name.trim(), description || null, price || 0, sku || null]);
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}