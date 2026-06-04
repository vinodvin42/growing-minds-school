import Link from "next/link";

export default function PageHero({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    <section className="page-hero-pro">
      <div className="page-hero-pro__pattern" />
      <div className="container position-relative page-hero-pro__inner">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="breadcrumb" className="page-hero-pro__breadcrumb">
            {breadcrumb.map((item, i) => (
              <span key={item.label}>
                {item.href ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span>{item.label}</span>
                )}
                {i < breadcrumb.length - 1 && <i className="fas fa-chevron-right mx-2" />}
              </span>
            ))}
          </nav>
        )}
        <h1 className="page-hero-pro__title">{title}</h1>
        {subtitle && <p className="page-hero-pro__subtitle">{subtitle}</p>}
      </div>
    </section>
  );
}
