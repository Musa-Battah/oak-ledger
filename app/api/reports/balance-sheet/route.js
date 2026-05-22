import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const asOfDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  try {
    // Assets
    const assets = await query(`
      SELECT 
        ca.account_number,
        ca.account_name,
        COALESCE(SUM(
          CASE 
            WHEN ca.normal_balance = 'debit' THEN gl.running_balance
            ELSE -gl.running_balance
          END
        ), 0) as balance
      FROM chart_of_accounts ca
      LEFT JOIN general_ledger gl ON ca.id = gl.account_id
      WHERE ca.account_type = 'asset'
        AND gl.transaction_date <= $1
      GROUP BY ca.id
      HAVING COALESCE(SUM(
        CASE 
          WHEN ca.normal_balance = 'debit' THEN gl.running_balance
          ELSE -gl.running_balance
        END
      ), 0) != 0
      ORDER BY ca.account_number
    `, [asOfDate]);
    
    // Liabilities
    const liabilities = await query(`
      SELECT 
        ca.account_number,
        ca.account_name,
        COALESCE(SUM(
          CASE 
            WHEN ca.normal_balance = 'credit' THEN gl.running_balance
            ELSE -gl.running_balance
          END
        ), 0) as balance
      FROM chart_of_accounts ca
      LEFT JOIN general_ledger gl ON ca.id = gl.account_id
      WHERE ca.account_type = 'liability'
        AND gl.transaction_date <= $1
      GROUP BY ca.id
      HAVING COALESCE(SUM(
        CASE 
          WHEN ca.normal_balance = 'credit' THEN gl.running_balance
          ELSE -gl.running_balance
        END
      ), 0) != 0
      ORDER BY ca.account_number
    `, [asOfDate]);
    
    // Equity
    const equity = await query(`
      SELECT 
        ca.account_number,
        ca.account_name,
        COALESCE(SUM(
          CASE 
            WHEN ca.normal_balance = 'credit' THEN gl.running_balance
            ELSE -gl.running_balance
          END
        ), 0) as balance
      FROM chart_of_accounts ca
      LEFT JOIN general_ledger gl ON ca.id = gl.account_id
      WHERE ca.account_type = 'equity'
        AND gl.transaction_date <= $1
      GROUP BY ca.id
      HAVING COALESCE(SUM(
        CASE 
          WHEN ca.normal_balance = 'credit' THEN gl.running_balance
          ELSE -gl.running_balance
        END
      ), 0) != 0
      ORDER BY ca.account_number
    `, [asOfDate]);
    
    const totalAssets = assets.rows.reduce((sum, a) => sum + parseFloat(a.balance), 0);
    const totalLiabilities = liabilities.rows.reduce((sum, l) => sum + parseFloat(l.balance), 0);
    const totalEquity = equity.rows.reduce((sum, e) => sum + parseFloat(e.balance), 0);
    
    return NextResponse.json({
      as_of_date: asOfDate,
      assets: assets.rows,
      liabilities: liabilities.rows,
      equity: equity.rows,
      totals: {
        assets: totalAssets,
        liabilities: totalLiabilities,
        equity: totalEquity,
        difference: totalAssets - (totalLiabilities + totalEquity)
      }
    });
  } catch (error) {
    console.error('Balance Sheet error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}