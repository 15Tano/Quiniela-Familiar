import { getFlagEmoji } from '../data/teams'

export default function TeamTag({ name, align = 'left', size = 'md' }) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }
  return (
    <div
      className={`flex items-center gap-2 min-w-0 ${
        align === 'right' ? 'flex-row-reverse text-right' : 'text-left'
      }`}
    >
      <span className={sizes[size]} aria-hidden="true">
        {getFlagEmoji(name)}
      </span>
      <span className="font-heading font-semibold text-ink truncate">{name}</span>
    </div>
  )
}
