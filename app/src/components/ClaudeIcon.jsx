export default function ClaudeIcon({ size = 13, color = '#D97757' }) {
  const c = size / 2
  const r = size * 0.46
  const r2 = size * 0.326
  const sw = size * 0.22
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, flexShrink: 0, marginTop: -1 }}
    >
      <line x1={c} y1={c - r} x2={c} y2={c + r} stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <line x1={c - r} y1={c} x2={c + r} y2={c} stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <line x1={c - r2} y1={c - r2} x2={c + r2} y2={c + r2} stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <line x1={c + r2} y1={c - r2} x2={c - r2} y2={c + r2} stroke={color} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  )
}
