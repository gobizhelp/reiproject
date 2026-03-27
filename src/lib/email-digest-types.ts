export interface EmailDigestSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  send_hour: number; // 0-23
  timezone: string;  // IANA timezone string
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
] as const;

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
  const ampm = i < 12 ? 'AM' : 'PM';
  return { value: i, label: `${hour12}:00 ${ampm}` };
});
