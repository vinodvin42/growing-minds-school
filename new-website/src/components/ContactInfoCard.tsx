import type { ReactNode } from "react";

type ContactInfoCardProps = {
  icon: string;
  title: string;
  accent: "orange" | "lime" | "blue" | "purple" | "yellow";
  children: ReactNode;
  wide?: boolean;
};

export default function ContactInfoCard({ icon, title, accent, children, wide }: ContactInfoCardProps) {
  return (
    <div className={`contact-info-card contact-info-card--${accent}${wide ? " contact-info-card--wide" : ""}`}>
      <div className="contact-info-card__icon">
        <i className={`fas ${icon}`} />
      </div>
      <div className="contact-info-card__body">
        <h5 className="contact-info-card__title">{title}</h5>
        <div className="contact-info-card__content">{children}</div>
      </div>
    </div>
  );
}
