export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";

// Members no longer edit forms directly - the form template is managed by admins at /admin/buy-box-form.
export default async function EditBuyBoxFormPage() {
  redirect("/buyers");
}
