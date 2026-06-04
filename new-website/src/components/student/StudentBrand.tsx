import { images } from "@/data/images";
import { PWA } from "@/lib/pwa";

type StudentBrandProps = {
  /** sm = app header, md = login, lg = hero */
  size?: "sm" | "md" | "lg";
  /** White text for green header backgrounds */
  variant?: "default" | "light";
  centered?: boolean;
  showTagline?: boolean;
};

export default function StudentBrand({
  size = "md",
  variant = "default",
  centered = false,
  showTagline = true,
}: StudentBrandProps) {
  return (
    <div
      className={[
        "student-brand",
        `student-brand--${size}`,
        variant === "light" ? "student-brand--light" : "",
        centered ? "student-brand--centered" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images.favicon} alt="" className="student-brand__logo" width={48} height={48} />
      <div className="student-brand__text">
        <span className="student-brand__name">{PWA.shortName}</span>
        {showTagline && (
          <span className="student-brand__tagline">English School · Student Portal</span>
        )}
      </div>
    </div>
  );
}
