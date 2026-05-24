import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT id, name, description, price, stock_quantity, is_active
      FROM products 
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
    const body = await request.json();
    const { name, description, price } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    const productPrice = price && !isNaN(parseFloat(price)) ? parseFloat(price) : 0;
    
    const result = await query(`
      INSERT INTO products (name, slug, description, price, stock_quantity, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, name, description, price, stock_quantity
    `, [name.trim(), slug, description || null, productPrice, 0]);
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}