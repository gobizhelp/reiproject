import { createAdminClient } from '@/lib/supabase/admin';
import { BuyBoxField, DEFAULT_BUY_BOX_FIELDS } from '@/lib/buy-box-types';

const SYSTEM_TEMPLATE_SLUG = '__system_buy_box_template__';

export { SYSTEM_TEMPLATE_SLUG };

/**
 * Fetch the system-wide buy box form template fields.
 * Falls back to DEFAULT_BUY_BOX_FIELDS if no template has been saved by an admin.
 */
export async function getSystemBuyBoxFields(): Promise<BuyBoxField[]> {
  const adminSupabase = createAdminClient();
  const { data } = await adminSupabase
    .from('buy_box_forms')
    .select('fields')
    .eq('slug', SYSTEM_TEMPLATE_SLUG)
    .single();

  if (data?.fields && Array.isArray(data.fields) && data.fields.length > 0) {
    return data.fields as BuyBoxField[];
  }

  return DEFAULT_BUY_BOX_FIELDS;
}

/**
 * Fetch the full system template form record, or null if none exists.
 */
export async function getSystemBuyBoxTemplate() {
  const adminSupabase = createAdminClient();
  const { data } = await adminSupabase
    .from('buy_box_forms')
    .select('*')
    .eq('slug', SYSTEM_TEMPLATE_SLUG)
    .single();

  return data;
}
