export const dynamic = 'force-dynamic';

import { getSystemBuyBoxTemplate } from '@/lib/buy-box-system-template';
import BuyBoxFormEditor from '@/components/buy-box-form-editor';
import { BuyBoxForm } from '@/lib/buy-box-types';

export default async function AdminBuyBoxFormPage() {
  const template = await getSystemBuyBoxTemplate();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">System Buy Box Form</h1>
      <p className="text-muted mb-8">
        Edit the standard buy box form used across the platform. Changes apply to all members immediately.
      </p>
      <BuyBoxFormEditor
        form={template as BuyBoxForm | undefined}
        isSystemTemplate
      />
    </div>
  );
}
