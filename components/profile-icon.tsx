import Link from "next/link";

type ProfileIconProps = {
  name: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return (parts[0] ?? "W").slice(0, 2).toUpperCase();
};

export const ProfileIcon = ({
  name,
  href = "/profile",
  onClick,
  isActive = false,
}: ProfileIconProps) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label="Open profile"
      aria-current={isActive ? "page" : undefined}
      className={`inline-flex size-10 items-center justify-center rounded-full text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
        isActive
          ? "bg-accent text-[color:var(--button-ink)]"
          : "border border-line bg-navy-soft text-ink hover:bg-navy"
      }`}
    >
      {getInitials(name)}
    </Link>
  );
};
