export type ProductionStatus = 'Design' | 'Cutting' | 'Sewing' | 'QC' | 'Ready';

export type SewingComplexity = 'simple' | 'standard' | 'premium';

export type EmbroideryType = 'none' | 'screenprint' | 'embroidery_small' | 'embroidery_large';

export interface ConvectionConfig {
  id?: string;
  ownerName: string;
  convectionName: string;
  slug: string;
  packageType?: 'starter' | 'growth' | 'pro';
  prices: {
    tshirt: number;
    polo: number;
    hoodie: number;
    workshirt: number;
  };
  whatsAppPhone?: string;
  email?: string;
  brandColor?: string; // 'indigo' | 'sky' | 'emerald' | 'rose' | 'amber' etc.
  tagline?: string;
  createdAt: number;
  paymentStatus?: 'pending' | 'paid' | 'expired';
  paymentMethod?: 'card' | 'bank_transfer';
  paymentDate?: number;
  subscriptionExpiry?: number; // Unix timestamp
}

export interface ConvectionOrder {
  id?: string;
  convectionSlug?: string; // Links this order to a specific custom convection tenant
  customerName: string;
  customerPhone: string;
  skuTitle: string;
  fabricType: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  complexity: SewingComplexity;
  embroideryType: EmbroideryType;
  deadline: string;
  status: ProductionStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  downPayment?: number;
  paymentStatus?: 'unpaid' | 'dp_paid' | 'fully_paid';
}

export interface WhatsAppNotification {
  id?: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  skuTitle: string;
  status: ProductionStatus;
  message: string;
  sentAt: number;
  isSent: boolean;
}

export interface EstimatorInputs {
  fabricType: string;
  quantity: number;
  complexity: SewingComplexity;
  embroideryType: EmbroideryType;
  markupPercent: number; // For suggested price profit margin calculation
}
