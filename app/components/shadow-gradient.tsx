type ShadowGradientProps = {
  className?: string
  direction: 'to-bottom' | 'to-top' | 'to-right'
}

const directionClasses = {
  'to-bottom':
    'bg-[linear-gradient(to_bottom,rgba(17,18,15,0.99)_0%,rgba(17,18,15,0.96)_24%,rgba(17,18,15,0.86)_46%,rgba(17,18,15,0.64)_66%,rgba(17,18,15,0.32)_84%,rgba(17,18,15,0)_100%)]',
  'to-top':
    'bg-[linear-gradient(to_top,rgba(17,18,15,0.99)_0%,rgba(17,18,15,0.96)_24%,rgba(17,18,15,0.86)_46%,rgba(17,18,15,0.64)_66%,rgba(17,18,15,0.32)_84%,rgba(17,18,15,0)_100%)]',
  'to-right':
    'bg-[linear-gradient(to_right,rgba(17,18,15,0.99)_0%,rgba(17,18,15,0.98)_30%,rgba(17,18,15,0.95)_52%,rgba(17,18,15,0.88)_68%,rgba(17,18,15,0.76)_79%,rgba(17,18,15,0.58)_88%,rgba(17,18,15,0.30)_95%,rgba(17,18,15,0)_100%)]',
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
