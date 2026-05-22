import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const asOfDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  try {
    const result = await query(`
      SELECT 
        ca.account_number,
        ca.account_name,
        ca.account_type,
        ca.normal_balance,
        COALESCE(SUM(gl.debit_amount), 0) as total_debits,
        COALESCE(SUM(gl.credit_amount), 0) as total_credits,
        CASE 
          WHEN ca.normal_balance = 'debit' THEN 
            COALESCE(SUM(gl.debit_amount), 0) - COALESCE(SUM(gl.credit_amount), 0)
          ELSE 
            COALESCE(SUM(gl.credit_amount), 0) - COALESCE(SUM(gl.debit_amount), 0)
        END as balance
      FROM chart_of_accounts ca
      LEFT JOIN general_ledger gl ON ca.id = gl.account_id
      WHERE gl.transaction_date <= $1 OR gl.transaction_date IS NULL
      GROUP BY ca.id, ca.account_number, ca.account_name, ca.account_type, ca.normal_balance
      ORDER BY ca.account_number
    `, [asOfDate]);
    
    // Filter out zero balance accounts and calculate proper totals
    const accounts = result.rows.filter(row => Math.abs(row.balance) > 0.01);
    
    let totalDebits = 0;
    let totalCredits = 0;
    
    for (const account of accounts) {
      if (account.balance > 0) {
        if (account.account_type === 'asset' || account.account_type === 'expense') {
          totalDebits += parseFloat(account.balance);
        } else {
          totalCredits += parseFloat(account.balance);
        }
      } else if (account.balance < 0) {
        if (account.account_type === 'liability' || account.account_type === 'equity' || account.account_type === 'revenue') {
          totalDebits += Math.abs(parseFloat(account.balance));
        } else {
          totalCredits += Math.abs(parseFloat(account.balance));
        }
      }
    }
    
    return NextResponse.json({
      as_of_date: asOfDate,
      accounts: accounts,
      totals: {
        debits: totalDebits,
        credits: totalCredits,
        difference: Math.abs(totalDebits - totalCredits),
        is_balanced: Math.abs(totalDebits - totalCredits) < 0.01
      }
    });
    
  } catch (error) {
    console.error('Trial balance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}