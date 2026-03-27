import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

export default function CTASection({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: CTASectionProps) {
  return (
    <section className="border-t border-border bg-card/50">
      <div className="max-w-4xl mx-auto px-4 py-20 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-muted text-lg max-w-xl mx-auto mb-8">{subtitle}</p>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
        >
          {ctaLabel} <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
