
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
    
    const { entry_date, description, lines } = await request.json();
    
    // Q: Why calculate totals?
    // A: To verify the fundamental accounting equation (Debits = Credits)
    let totalDebits = 0;
    let totalCredits = 0;
    
    for (const line of lines) {
      totalDebits += line.debit_amount || 0;
      totalCredits += line.credit_amount || 0;
    }
    
    // Q: What happens if they don't balance?
    // A: The journal entry is invalid and must be rejected
    if (totalDebits !== totalCredits) {
      return NextResponse.json({ 
        error: 'Journal entry does not balance. Debits must equal Credits.' 
      }, { status: 400 });
    }
    
    // Generate entry number (e.g., JE-2024-0001)
    const entryNumber = `JE-${new Date().getFullYear()}-${Date.now()}`;
    
    // Start transaction - Q: Why use transaction?
    // A: Multiple operations must succeed or fail together
    const pool = (await import('@/lib/db')).default;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create journal entry header
      const journalResult = await client.query(`
        INSERT INTO journal_entries (entry_number, entry_date, description, created_by, status)
        VALUES ($1, $2, $3, $4, 'posted')
        RETURNING *
      `, [entryNumber, entry_date, description, decoded.userId]);
      
      const journalEntry = journalResult.rows[0];
      
      // Create journal entry lines (debits and credits)
      for (const line of lines) {
        await client.query(`
          INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
          VALUES ($1, $2, $3, $4, $5)
        `, [journalEntry.id, line.account_id, line.debit_amount || 0, line.credit_amount || 0, line.description]);
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json(journalEntry, { status: 201 });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Journal entry error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}