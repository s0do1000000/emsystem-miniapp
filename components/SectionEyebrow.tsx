import Stroke from "./Stroke";

export default function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-col gap-2">
      <span className="eyebrow text-gold">{children}</span>
      <Stroke className="text-gold/70" width={56} />
    </div>
  );
}
