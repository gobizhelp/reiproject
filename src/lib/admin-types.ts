export interface AdminDashboardMetrics {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalBothUsers: number;
  totalProperties: number;
  publishedProperties: number;
  draftProperties: number;
  featuredProperties: number;
  flaggedProperties: number;
  totalMessages: number;
  unreadMessages: number;
  totalBuyBoxSubmissions: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  newPropertiesLast7Days: number;
  newPropertiesLast30Days: number;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  created_at: string;
  admin_name?: string;
}

export interface UserWithDetails {
  id: string;
  email: string;
  user_role: string;
  active_view: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  is_admin: boolean;
  is_suspended: boolean;
  suspended_reason: string | null;
  buyer_tier: string;
  seller_tier: string;
  created_at: string;
  property_count: number;
  message_count: number;
}
