import clsx from 'clsx'

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'gray'
  | 'blue'
  | 'green'
  | 'emerald'
  | 'purple'
  | 'cyan'
  | 'running'
  | 'completed'
  | 'draft'
  | 'failed'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'rcs'

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-[#7c3aed]/15 text-[#a78bfa] border-[#7c3aed]/30',
  secondary: 'bg-[#06b6d4]/15 text-[#22d3ee] border-[#06b6d4]/30',
  success: 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30',
  warning: 'bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30',
  danger: 'bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30',
  gray: 'bg-[#64748b]/15 text-[#94a3b8] border-[#64748b]/30',
  blue: 'bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30',
  green: 'bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30',
  emerald: 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30',
  purple: 'bg-[#8b5cf6]/15 text-[#a78bfa] border-[#8b5cf6]/30',
  cyan: 'bg-[#06b6d4]/15 text-[#22d3ee] border-[#06b6d4]/30',
  running: 'bg-[#06b6d4]/15 text-[#22d3ee] border-[#06b6d4]/30',
  completed: 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30',
  draft: 'bg-[#64748b]/15 text-[#94a3b8] border-[#64748b]/30',
  failed: 'bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30',
  email: 'bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30',
  sms: 'bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30',
  whatsapp: 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30',
  rcs: 'bg-[#8b5cf6]/15 text-[#a78bfa] border-[#8b5cf6]/30',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

export default function Badge({ children, variant = 'gray', className, dot = false }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full inline-block',
            variant === 'running' || variant === 'cyan' || variant === 'secondary'
              ? 'bg-[#22d3ee]'
              : variant === 'completed' || variant === 'success' || variant === 'emerald' || variant === 'green' || variant === 'whatsapp'
              ? 'bg-[#34d399]'
              : variant === 'danger' || variant === 'failed'
              ? 'bg-[#f87171]'
              : variant === 'warning'
              ? 'bg-[#fbbf24]'
              : variant === 'blue' || variant === 'email'
              ? 'bg-[#60a5fa]'
              : variant === 'purple' || variant === 'rcs' || variant === 'primary'
              ? 'bg-[#a78bfa]'
              : 'bg-[#94a3b8]'
          )}
        />
      )}
      {children}
    </span>
  )
}
