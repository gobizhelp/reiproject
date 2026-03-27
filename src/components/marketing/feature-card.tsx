import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon: Icon,
  iconColor = "text-accent",
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8">
      <Icon className={`w-10 h-10 ${iconColor} mb-4`} />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted">{description}</p>
    </div>
  );
}
