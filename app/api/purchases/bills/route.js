import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT pb.*, s.name as supplier_name 
      FROM purchase_bills pb
      LEFT JOIN suppliers s ON pb.supplier_id = s.id
      ORDER BY pb.date DESC
      LIMIT 50
    `);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json([]);
  }
}