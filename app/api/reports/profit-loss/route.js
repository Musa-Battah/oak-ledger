import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  try {
    // Get Revenue accounts
    const revenueResult = await query(`
      SELECT 
        ca.account_number,
        ca.account_name,
        COALESCE(SUM(
          CASE 
            WHEN ca.normal_balance = 'credit' THEN jel.credit_amount - jel.debit_amount
            ELSE jel.debit_amount - jel.credit_amount
          END
        ), 0) as balance
      FROM chart_of_accounts ca
      LEFT JOIN journal_entry_lines jel ON ca.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE ca.account_type = 'revenue'
        AND je.status = 'posted'
        AND ($1::date IS NULL OR je.entry_date >= $1)
        AND ($2::date IS NULL OR je.entry_date <= $2)
      GROUP BY ca.id
      HAVING COALESCE(SUM(
        CASE 
          WHEN ca.normal_balance = 'credit' THEN jel.credit_amount - jel.debit_amount
          ELSE jel.debit_amount - jel.credit_amount
        END
      ), 0) != 0
      ORDER BY ca.account_number
    `, [startDate || null, endDate || null]);
    
    // Get Expense accounts
    const expenseResult = await query(`
      SELECT 
        ca.account_number,
        ca.account_name,
        COALESCE(SUM(
          CASE 
            WHEN ca.normal_balance = 'debit' THEN jel.debit_amount - jel.credit_amount
            ELSE jel.credit_amount - jel.debit_amount
          END
        ), 0) as balance
      FROM chart_of_accounts ca
      LEFT JOIN journal_entry_lines jel ON ca.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE ca.account_type = 'expense'
        AND je.status = 'posted'
        AND ($1::date IS NULL OR je.entry_date >= $1)
        AND ($2::date IS NULL OR je.entry_date <= $2)
      GROUP BY ca.id
      HAVING COALESCE(SUM(
        CASE 
          WHEN ca.normal_balance = 'debit' THEN jel.debit_amount - jel.credit_amount
          ELSE jel.credit_amount - jel.debit_amount
        END
      ), 0) != 0
      ORDER BY ca.account_number
    `, [startDate || null, endDate || null]);
    
    const totalRevenue = revenueResult.rows.reduce((sum, r) => sum + parseFloat(r.balance), 0);
    const totalExpenses = expenseResult.rows.reduce((sum, r) => sum + parseFloat(r.balance), 0);
    const netIncome = totalRevenue - totalExpenses;
    
    return NextResponse.json({
      period: { startDate, endDate },
      revenue: revenueResult.rows,
      expenses: expenseResult.rows,
      totals: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        net_income: netIncome
      }
    });
  } catch (error) {
    console.error('Profit & Loss error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}