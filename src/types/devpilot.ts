export type Language = 'bn' | 'en';
export type UserRole = 'customer' | 'admin' | 'support';
export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  company?: string;
  avatar?: string;
  emailVerified: boolean;
  status: 'active' | 'suspended';
  createdAt: string;
  preferredLanguage: Language;
}

export interface RefundRecord {
  amountBdt: number;
  reason: string;
  approvedAt: string;
  approvedBy: string;
  method: string;
  trxId?: string;
}

export interface AppNotification {
  id: string;
  userId: string; // 'admin' or specific customerId / email
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  type: 'order' | 'payment' | 'quotation' | 'delivery' | 'ticket' | 'refund' | 'security';
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export type ServiceType = 'fixed' | 'quotation';

export interface ServiceItem {
  id: string;
  titleBn: string;
  titleEn: string;
  shortDescBn: string;
  shortDescEn: string;
  fullDescBn: string;
  fullDescEn: string;
  category: 'web_dev' | 'bug_fix' | 'api' | 'ui_ux' | 'maintenance' | 'automation';
  type: ServiceType;
  priceBdt: number;
  estimatedDays: number;
  featuresBn: string[];
  featuresEn: string[];
  requirementsPromptBn: string;
  requirementsPromptEn: string;
  isPublished: boolean;
  badgeBn?: string;
  badgeEn?: string;
  iconName: string;
}

export type OrderStatus =
  | 'pending'             // অপেক্ষমান (নতুন অর্ডার)
  | 'quotation_sent'      // কোটেশন প্রেরিত
  | 'awaiting_payment'    // পেমেন্ট আবশ্যক
  | 'paid'                // পেমেন্ট নিশ্চিত / কাজ শুরু
  | 'in_progress'         // কাজ চলছে
  | 'revision_requested'  // সংশোধন চাওয়া হয়েছে
  | 'delivered'           // ডেলিভারি দেওয়া হয়েছে
  | 'completed'           // সম্পন্ন
  | 'cancelled';          // বাতিল

export type PaymentStatus = 'unpaid' | 'verification_pending' | 'paid' | 'rejected' | 'refunded';

export type PaymentMethodType = 'bkash' | 'nagad' | 'rocket' | 'bank';

export interface PaymentSubmission {
  method: PaymentMethodType;
  trxId: string;
  senderAccount: string;
  amountBdt: number;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface OrderAttachment {
  name: string;
  url: string;
  sizeKb: number;
  uploadedAt: string;
}

export interface DeliverySubmission {
  notes: string;
  files: Array<{ name: string; url: string; sizeKb?: number; code?: string }>;
  submittedAt: string;
  aiGenerated?: boolean;
  livePreviewHtml?: string;
  deliverableFiles?: Array<{ name: string; code: string; description?: string }>;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  titleBn: string;
  titleEn: string;
  note?: string;
  actor: string;
  timestamp: string;
}

export interface OrderRecord {
  id: string;                     // e.g. DP-ORD-2026-101
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceTitleBn: string;
  serviceTitleEn: string;
  category: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  priceBdt: number;
  quotationAmountBdt?: number;
  quotationNote?: string;
  projectRequirements: string;
  deadlineDate?: string;
  attachments: OrderAttachment[];
  payment?: PaymentSubmission;
  deliveries: DeliverySubmission[];
  revisionRequests: Array<{
    reason: string;
    requestedAt: string;
    status: 'open' | 'resolved';
  }>;
  refund?: RefundRecord;
  progressTimeline?: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: SupportTicketMessage[];
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: 'hosting' | 'tools' | 'domains' | 'subcontractor' | 'marketing' | 'other';
  amountBdt: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  details: string;
  targetId?: string;
  timestamp: string;
}

export interface PlatformPaymentConfig {
  bkashNumber: string;
  bkashType: 'Personal' | 'Merchant';
  bkashInstructionsBn: string;
  bkashInstructionsEn: string;
  nagadNumber: string;
  nagadType: 'Personal' | 'Merchant';
  nagadInstructionsBn: string;
  nagadInstructionsEn: string;
  rocketNumber: string;
  rocketType: 'Personal' | 'Merchant';
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  routingNumber: string;
}

export interface PlatformSettings {
  brandName: string;
  taglineBn: string;
  taglineEn: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  paymentConfig: PlatformPaymentConfig;
  aiAssistantEnabled: boolean;
  aiDailyLimitPerUser: number;
}
