/** Playful corner decorations — fixed, non-interactive, hidden on admin & reduced-motion. */
const CORNER_ITEMS = [
  { id: "pencil", emoji: "✏️", className: "floating-element--tl", label: "Pencil" },
  { id: "star", emoji: "⭐", className: "floating-element--tr", label: "Star" },
  { id: "palette", emoji: "🎨", className: "floating-element--bl", label: "Art palette" },
  { id: "book", emoji: "📚", className: "floating-element--br", label: "Books" },
  { id: "balloon", emoji: "🎈", className: "floating-element--tl-2", label: "Balloon" },
  { id: "rainbow", emoji: "🌈", className: "floating-element--br-2", label: "Rainbow" },
] as const;

export default function FloatingElements() {
  return (
    <div className="floating-decor" aria-hidden="true">
      {CORNER_ITEMS.map((item) => (
        <span key={item.id} className={`floating-element ${item.className}`} title={item.label}>
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
