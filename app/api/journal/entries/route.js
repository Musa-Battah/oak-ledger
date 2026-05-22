import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || 50;
  
  try {
    const result = await query(`
      SELECT 
        je.*,
        COALESCE(SUM(jel.debit_amount), 0) as total_debit,
        COALESCE(SUM(jel.credit_amount), 0) as total_credit
      FROM journal_entries je
      LEFT JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
      GROUP BY je.id
      ORDER BY je.entry_date DESC
      LIMIT $1
    `, [limit]);
    
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json([]);
  }
}