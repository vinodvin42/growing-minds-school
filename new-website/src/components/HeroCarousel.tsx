import Link from "next/link";
import type { CarouselSlide } from "@/types/content";
import { resolveImageCrop } from "@/lib/image-crop";

function getSlideContent(slide: CarouselSlide, index: number) {
  const title = slide.title || slide.caption;
  const imagePosition = slide.imagePosition || (index % 2 === 0 ? "right" : "left");

  return { title, imagePosition };
}

function SlideImage({ slide, priority }: { slide: CarouselSlide; priority?: boolean }) {
  const { fit, position } = resolveImageCrop({
    fit: slide.imageFit,
    focusX: slide.imageFocusX,
    focusY: slide.imageFocusY,
    focus: slide.imageFocus,
  });

  return (
    <div className={`carousel-split__image-wrap${fit === "contain" ? " carousel-split__image-wrap--contain" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.imageUrl}
        alt={slide.alt}
        loading={priority ? "eager" : "lazy"}
        style={{ objectFit: fit, objectPosition: position }}
      />
    </div>
  );
}

function SlideContent({
  slide,
  title,
}: {
  slide: CarouselSlide;
  title: string;
}) {
  return (
    <div className="carousel-split__content">
      {slide.eyebrow && <span className="carousel-split__eyebrow">{slide.eyebrow}</span>}
      <h2 className="carousel-split__title">{title}</h2>
      {slide.description && <p className="carousel-split__description">{slide.description}</p>}
      {slide.linkUrl && slide.linkText && (
        <Link href={slide.linkUrl} className="btn btn-orange carousel-split__cta">
          {slide.linkText}
          <i className="fas fa-arrow-right ms-2" />
        </Link>
      )}
    </div>
  );
}

export default function HeroCarousel({ slides }: { slides: CarouselSlide[] }) {
  if (slides.length === 0) return null;

  return (
    <div id="heroCarousel" className="carousel slide carousel-fade carousel-split" data-bs-ride="carousel">
      <div className="carousel-indicators carousel-split__indicators">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to={i}
            className={i === 0 ? "active" : ""}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="carousel-inner">
        {slides.map((slide, i) => {
          const { title, imagePosition } = getSlideContent(slide, i);
          const imageFirst = imagePosition === "left";

          return (
            <div key={slide.id} className={`carousel-item ${i === 0 ? "active" : ""}`}>
              <div className="carousel-split__slide">
                <div className="container">
                  <div className="row align-items-center g-4 g-lg-5">
                    {imageFirst ? (
                      <>
                        <div className="col-lg-6 carousel-split__media order-1">
                          <SlideImage slide={slide} priority={i === 0} />
                        </div>
                        <div className="col-lg-6 order-2">
                          <SlideContent slide={slide} title={title} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-lg-6 order-2 order-lg-1">
                          <SlideContent slide={slide} title={title} />
                        </div>
                        <div className="col-lg-6 carousel-split__media order-1 order-lg-2">
                          <SlideImage slide={slide} priority={i === 0} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="carousel-control-prev carousel-split__control" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" />
      </button>
      <button className="carousel-control-next carousel-split__control" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" />
      </button>
    </div>
  );
}
