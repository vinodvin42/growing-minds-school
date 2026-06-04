export default function SectionHeader({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "center",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <div className={`section-header section-header--${align} ${light ? "section-header--light" : ""} mb-5`}>
      {eyebrow && <span className="section-header__eyebrow">{eyebrow}</span>}
      <h2 className="section-header__title">
        {title}
        {highlight && <> <span className="text-gradient">{highlight}</span></>}
      </h2>
      <div className="section-header__line" />
      {subtitle && <p className="section-header__subtitle">{subtitle}</p>}
    </div>
  );
}
