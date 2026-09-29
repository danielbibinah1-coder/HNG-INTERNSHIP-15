export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span
      className="grid flex-none place-content-center rounded-lg"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, var(--neon-2), var(--deep))',
        boxShadow: '0 0 16px -5px var(--glow)',
      }}
      aria-hidden="true"
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12.5 10 17.5 19 7"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
