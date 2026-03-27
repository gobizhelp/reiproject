import type { LucideIcon } from "lucide-react";

interface StepCardProps {
  step: number;
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
}

export default function StepCard({
  step,
  icon: Icon,
  iconColor = "text-accent",
  title,
  description,
}: StepCardProps) {
  return (
    <div className="relative bg-card border border-border rounded-2xl p-8">
      <div className="flex items-center gap-4 mb-4">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent text-lg font-bold">
          {step}
        </span>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted">{description}</p>
    </div>
  );
}
