interface TagLike {
  name: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export function TagBadge({ tag, className = "" }: { tag: TagLike; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium tracking-wide ${className}`}
      style={{ backgroundColor: tag.bgColor, borderColor: tag.borderColor, color: tag.textColor }}
    >
      {tag.name}
    </span>
  );
}
