type ShadowGradientProps = {
  className?: string
  direction: 'to-bottom' | 'to-top' | 'to-right'
}

const directionClasses = {
  'to-bottom': 'shadow-gradient-to-bottom',
  'to-top': 'shadow-gradient-to-top',
  'to-right': 'shadow-gradient-to-right',
} satisfies Record<ShadowGradientProps['direction'], string>

export function ShadowGradient({
  className = '',
  direction,
}: ShadowGradientProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 block ${directionClasses[direction]} ${className}`.trim()}
    />
  )
}
