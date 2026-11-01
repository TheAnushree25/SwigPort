// Label whose characters roll up on hover of the closest `.roll-host`.
export default function Roll({ text, className = '' }) {
  const row = (alt) => (
    <span className={`roll-row${alt ? ' roll-row--alt' : ''}`} aria-hidden="true">
      {[...text].map((ch, i) => (
        <span key={i} className="roll-char" style={{ '--i': i }}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
  return (
    <span className={`roll ${className}`}>
      <span className="sr-only">{text}</span>
      {row(false)}
      {row(true)}
    </span>
  )
}
