import { resolveImageCrop, type ImageCropValues } from "@/lib/image-crop";

type ContentImageProps = {
  src: string;
  alt: string;
  className?: string;
  variant?: "landscape" | "portrait";
  crop?: ImageCropValues;
};

export default function ContentImage({
  src,
  alt,
  className = "",
  variant = "landscape",
  crop = {},
}: ContentImageProps) {
  const { fit, position } = resolveImageCrop(crop);

  return (
    <div
      className={`content-image-frame content-image-frame--${variant}${fit === "contain" ? " content-image-frame--contain" : ""} ${className}`.trim()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{ objectFit: fit, objectPosition: position }}
      />
    </div>
  );
}
