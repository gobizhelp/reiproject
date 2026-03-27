import { Quote } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  company?: string;
}

export default function TestimonialCard({
  quote,
  name,
  role,
  company,
}: TestimonialCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8">
      <Quote className="w-8 h-8 text-accent/40 mb-4" />
      <p className="text-foreground text-lg leading-relaxed mb-6">
        &ldquo;{quote}&rdquo;
      </p>
      <div>
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-muted text-sm">
          {role}
          {company && ` · ${company}`}
        </p>
      </div>
    </div>
  );
}
