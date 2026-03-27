export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";

// Members no longer create forms manually - they use the auto-create button on /buyers.
// The form template is managed by admins at /admin/buy-box-form.
export default async function NewBuyBoxFormPage() {
  redirect("/buyers");
}
