interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  bg?: "default" | "card" | "card-subtle";
  border?: "top" | "bottom" | "both" | "none";
  id?: string;
}

export default function SectionWrapper({
  children,
  className = "",
  bg = "default",
  border = "none",
  id,
}: SectionWrapperProps) {
  const bgClass =
    bg === "card"
      ? "bg-card"
      : bg === "card-subtle"
        ? "bg-card/50"
        : "";

  const borderClass =
    border === "top"
      ? "border-t border-border"
      : border === "bottom"
        ? "border-b border-border"
        : border === "both"
          ? "border-y border-border"
          : "";

  return (
    <section id={id} className={`${bgClass} ${borderClass}`}>
      <div className={`max-w-6xl mx-auto px-4 py-16 md:py-24 ${className}`}>
        {children}
      </div>
    </section>
  );
}
