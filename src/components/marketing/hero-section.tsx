import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
}

export default function HeroSection({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  primaryCTA,
  secondaryCTA,
}: HeroSectionProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
      {eyebrow && (
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
          {eyebrow}
        </p>
      )}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
        {title}
        {titleAccent && (
          <>
            <br />
            <span className="text-accent">{titleAccent}</span>
          </>
        )}
      </h1>
      <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10">
        {subtitle}
      </p>
      {(primaryCTA || secondaryCTA) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {primaryCTA && (
            <Link
              href={primaryCTA.href}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              {primaryCTA.label} <ArrowRight className="w-5 h-5" />
            </Link>
          )}
          {secondaryCTA && (
            <Link
              href={secondaryCTA.href}
              className="inline-flex items-center gap-2 border border-border hover:border-accent text-foreground px-8 py-4 rounded-xl text-lg font-medium transition-colors"
            >
              {secondaryCTA.label}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
