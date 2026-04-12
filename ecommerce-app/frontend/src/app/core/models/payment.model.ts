export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface PaymentMethodmodel {
  value: string;
  label: string;
  icon:  string;
  description: string;
}

export interface PaymentRecordmodel {
  id:            number;
  orderId:       number;
  amount:        number;
  method:        string;
  status:        PaymentStatus;
  transactionId: string | null;
  createdAt:     string;
}

// The available payment methods shown in checkout UI
export const PAYMENT_METHODS: PaymentMethodmodel[] = [
  {
    value:       'credit_card',
    label:       'Credit Card',
    icon:        '💳',
    description: 'Visa, Mastercard, Amex',
  },
  {
    value:       'debit_card',
    label:       'Debit Card',
    icon:        '💳',
    description: 'All major bank cards',
  },
  {
    value:       'upi',
    label:       'UPI',
    icon:        '📱',
    description: 'GPay, PhonePe, Paytm',
  },
  {
    value:       'cash_on_delivery',
    label:       'Cash on Delivery',
    icon:        '💵',
    description: 'Pay when your order arrives',
  },
  {
    value:       'bank_transfer',
    label:       'Bank Transfer',
    icon:        '🏦',
    description: 'NEFT / RTGS / IMPS',
  },
];