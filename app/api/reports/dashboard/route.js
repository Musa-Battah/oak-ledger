import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Total journal entries
    const entriesResult = await query('SELECT COUNT(*) FROM journal_entries WHERE status = \'posted\'');
    
    // Total debits and credits
    const totalsResult = await query(`
      SELECT 
        COALESCE(SUM(debit_amount), 0) as total_debits,
        COALESCE(SUM(credit_amount), 0) as total_credits
      FROM journal_entry_lines
    `);
    
    return NextResponse.json({
      totalEntries: parseInt(entriesResult.rows[0].count),
      totalDebits: parseFloat(totalsResult.rows[0].total_debits),
      totalCredits: parseFloat(totalsResult.rows[0].total_credits),
      isBalanced: Math.abs(totalsResult.rows[0].total_debits - totalsResult.rows[0].total_credits) < 0.01
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({
      totalEntries: 0,
      totalDebits: 0,
      totalCredits: 0,
      isBalanced: true
    });
  }
}