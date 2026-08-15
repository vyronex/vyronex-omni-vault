/** VNX brand mark — angular "V" chevron inside a rounded square. */
export default function VnxMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="VNX"
      className={className}
    >
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" fill="hsl(var(--primary))" />
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" stroke="hsl(var(--foreground) / 0.14)" strokeWidth="1.5" />
      <path
        d="M7.5 9.5h4.4L16 20.2l4.1-10.7h4.4L18.1 25h-4.2L7.5 9.5Z"
        fill="hsl(var(--primary-foreground))"
      />
      <path d="M20.6 7h4.6l-2.2 5.2h-4.6L20.6 7Z" fill="hsl(var(--primary-foreground) / 0.55)" />
    </svg>
  );
}
