export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BuyBoxPublicForm from "@/components/buy-box-public-form";
import { BuyBoxForm } from "@/lib/buy-box-types";
import { getSystemBuyBoxFields } from "@/lib/buy-box-system-template";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: form } = await supabase
    .from("buy_box_forms")
    .select("title")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!form) return { title: "Form Not Found" };

  return {
    title: `${form.title} - Buy Box`,
    description: "Submit your investment criteria",
    openGraph: {
      title: `${form.title} - Buy Box`,
      description: "Submit your investment criteria",
    },
  };
}

export default async function BuyBoxPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("buy_box_forms")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!form) notFound();

  // Always use the system template fields so the form is standardized
  const systemFields = await getSystemBuyBoxFields();
  const standardizedForm = { ...form, fields: systemFields } as BuyBoxForm;

  return <BuyBoxPublicForm form={standardizedForm} />;
}
