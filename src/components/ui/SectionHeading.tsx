interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
}: SectionHeadingProps) {
  return (
    <div
      className={`mx-auto max-w-2xl ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
      <h2
        className={`mt-2 font-display text-3xl font-bold sm:text-4xl ${
          light ? "text-white" : "text-navy-900"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-base leading-relaxed ${
            light ? "text-navy-100" : "text-navy-500"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
