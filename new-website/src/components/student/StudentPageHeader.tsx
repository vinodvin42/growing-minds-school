export default function StudentPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="student-page-header">
      <h1 className="student-page-header__title">{title}</h1>
      {subtitle ? <p className="student-page-header__subtitle">{subtitle}</p> : null}
    </header>
  );
}
