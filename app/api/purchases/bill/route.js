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
    
    const { supplier_name, supplier_email, date, due_date, items, tax_rate } = await request.json();
    
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const tax_amount = subtotal * (tax_rate / 100);
    const total = subtotal + tax_amount;
    
    const billNumber = `BILL-${new Date().getFullYear()}-${Date.now()}`;
    
    const pool = (await import('@/lib/db')).default;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create supplier
      let supplierResult = await client.query(
        'SELECT id FROM suppliers WHERE email = $1',
        [supplier_email]
      );
      
      let supplierId;
      if (supplierResult.rows.length === 0) {
        const newSupplier = await client.query(
          'INSERT INTO suppliers (name, email) VALUES ($1, $2) RETURNING id',
          [supplier_name, supplier_email]
        );
        supplierId = newSupplier.rows[0].id;
      } else {
        supplierId = supplierResult.rows[0].id;
      }
      
      // Create bill
      const billResult = await client.query(`
        INSERT INTO purchase_bills (bill_number, supplier_id, date, due_date, subtotal, tax_rate, tax_amount, total, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'received')
        RETURNING *
      `, [billNumber, supplierId, date, due_date, subtotal, tax_rate, tax_amount, total]);
      
      const bill = billResult.rows[0];
      
      for (const item of items) {
        await client.query(`
          INSERT INTO bill_items (bill_id, product_name, quantity, unit_price, total)
          VALUES ($1, $2, $3, $4, $5)
        `, [bill.id, item.product_name, item.quantity, item.unit_price, item.quantity * item.unit_price]);
      }
      
      // CREATE JOURNAL ENTRY for Purchase
      // When you purchase goods on credit:
      // Debit: Inventory (Asset increases)
      // Debit: VAT Receivable (Asset increases - input VAT)
      // Credit: Accounts Payable (Liability increases)
      
      const journalEntryNumber = `JE-${new Date().getFullYear()}-${Date.now()}`;
      
      const inventory = await client.query(
        "SELECT id FROM chart_of_accounts WHERE account_number = '1-1300'"
      );
      const vatReceivable = await client.query(
        "SELECT id FROM chart_of_accounts WHERE account_number = '1-1400'"
      );
      const accountsPayable = await client.query(
        "SELECT id FROM chart_of_accounts WHERE account_number = '2-2100'"
      );
      
      const journalResult = await client.query(`
        INSERT INTO journal_entries (entry_number, entry_date, description, created_by, status)
        VALUES ($1, $2, $3, $4, 'posted')
        RETURNING *
      `, [journalEntryNumber, date, `Purchase bill ${billNumber} from ${supplier_name}`, decoded.userId]);
      
      const journalEntry = journalResult.rows[0];
      
      // Debit: Inventory
      await client.query(`
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [journalEntry.id, inventory.rows[0].id, subtotal, 0, `Bill ${billNumber}`]);
      
      // Debit: VAT Receivable
      await client.query(`
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [journalEntry.id, vatReceivable.rows[0].id, tax_amount, 0, `VAT on bill ${billNumber}`]);
      
      // Credit: Accounts Payable
      await client.query(`
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [journalEntry.id, accountsPayable.rows[0].id, 0, total, `Bill ${billNumber}`]);
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        bill: bill,
        journal_entry: journalEntryNumber,
        message: `Bill ${billNumber} created successfully`
      });
      
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