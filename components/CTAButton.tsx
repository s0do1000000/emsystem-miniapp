"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type CTAButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  external?: boolean;
  className?: string;
  onClick?: () => void;
};

export default function CTAButton({
  href,
  children,
  variant = "solid",
  external = false,
  className = "",
  onClick,
}: CTAButtonProps) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold tracking-wide transition-transform active:scale-[0.98]";
  const styles =
    variant === "solid"
      ? "bg-gold text-ink hover:bg-goldLight"
      : "border border-gold/50 text-goldLight hover:border-gold";

  const content = (
    <>
      <span>{children}</span>
      {external && <ArrowUpRight size={16} />}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={`${base} ${styles} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={`${base} ${styles} ${className}`}>
      {content}
    </Link>
  );
}
