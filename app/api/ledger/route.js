import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId');
  
  try {
    if (accountId) {
      // Get ledger for specific account
      const result = await query(`
        SELECT 
          gl.*,
          je.entry_number,
          je.entry_date,
          je.description as journal_description
        FROM general_ledger gl
        JOIN journal_entries je ON gl.journal_entry_id = je.id
        WHERE gl.account_id = $1
        ORDER BY gl.transaction_date ASC
      `, [accountId]);
      
      // Get account info
      const accountResult = await query(
        'SELECT * FROM chart_of_accounts WHERE id = $1',
        [accountId]
      );
      
      return NextResponse.json({
        account: accountResult.rows[0],
        transactions: result.rows
      });
    } else {
      // Get all accounts with balances
      const result = await query(`
        SELECT 
          ca.*,
          COALESCE((
            SELECT running_balance 
            FROM general_ledger 
            WHERE account_id = ca.id 
            ORDER BY transaction_date DESC, id DESC 
            LIMIT 1
          ), 0) as current_balance
        FROM chart_of_accounts ca
        WHERE ca.is_active = true
        ORDER BY ca.account_number
      `);
      
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error('Ledger error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}