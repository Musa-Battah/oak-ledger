import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { supplier_id, date, due_date, tax_rate, notes, items } = await request.json();
    
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const tax_amount = subtotal * (tax_rate / 100);
    const total = subtotal + tax_amount;
    const billNumber = `BILL-${new Date().getFullYear()}-${Date.now()}`;
    
    const pool = (await import('@/lib/db')).default;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const billResult = await client.query(`
        INSERT INTO purchase_bills (bill_number, supplier_id, date, due_date, subtotal, tax_rate, tax_amount, total, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'received')
        RETURNING *
      `, [billNumber, supplier_id, date, due_date, subtotal, tax_rate, tax_amount, total, notes || null]);
      
      const bill = billResult.rows[0];
      
      for (const item of items) {
        await client.query(`
          INSERT INTO bill_items (bill_id, product_name, description, quantity, unit_price, total)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [bill.id, item.product_name, item.description || null, item.quantity, item.unit_price, item.quantity * item.unit_price]);
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({ success: true, bill });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Bill error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}