export interface Transaction {
  id: string
  user_id: string
  transaction_type: 'Credit' | 'Debit'
  purchase_order_id?: string
  sales_order_id?: string
  amount: number
  occured_at: Date
  created_at: Date
  updated_at: Date
}
