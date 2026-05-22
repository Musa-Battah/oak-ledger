import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  try {
    // Operating Activities
    const operatingResult = await query(`
      SELECT 
        SUM(jel.debit_amount) as cash_inflows,
        SUM(jel.credit_amount) as cash_outflows
      FROM journal_entry_lines jel
      JOIN journal_entries je ON jel.journal_entry_id = je.id
      JOIN chart_of_accounts ca ON jel.account_id = ca.id
      WHERE ca.account_number LIKE '1-1100'  -- Cash account
        AND je.status = 'posted'
        AND ($1::date IS NULL OR je.entry_date >= $1)
        AND ($2::date IS NULL OR je.entry_date <= $2)
    `, [startDate || null, endDate || null]);
    
    return NextResponse.json({
      period: { startDate, endDate },
      operating: {
        inflows: parseFloat(operatingResult.rows[0].cash_inflows || 0),
        outflows: parseFloat(operatingResult.rows[0].cash_outflows || 0),
        net: parseFloat(operatingResult.rows[0].cash_inflows || 0) - parseFloat(operatingResult.rows[0].cash_outflows || 0)
      }
    });
  } catch (error) {
    console.error('Cash Flow error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}