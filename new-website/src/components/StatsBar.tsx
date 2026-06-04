const stats = [
  { value: "Nursery–8th", label: "Standards Offered", icon: "fa-graduation-cap" },
  { value: "2026", label: "Admissions Open", icon: "fa-calendar-check" },
  { value: "100%", label: "English Medium", icon: "fa-language" },
  { value: "Malad West", label: "Mumbai Location", icon: "fa-map-marker-alt" },
];

export default function StatsBar() {
  return (
    <section className="stats-bar">
      <div className="container">
        <div className="row g-0">
          {stats.map((stat) => (
            <div key={stat.label} className="col-6 col-lg-3">
              <div className="stats-bar__item">
                <div className="stats-bar__icon">
                  <i className={`fas ${stat.icon}`} />
                </div>
                <div>
                  <div className="stats-bar__value">{stat.value}</div>
                  <div className="stats-bar__label">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
