export enum EventType {
  ACCOUNT_LINKED = 'ACCOUNT_LINKED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  INVOICES_PAID = 'INVOICES_PAID',
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  ACCOUNT_UPDATED = 'ACCOUNT_UPDATED',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}