import React from 'react'
import clsx from 'clsx'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label?: string
  }
  accentColor?: string
  loading?: boolean
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = '#7c3aed',
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="glass-card p-5 animate-fade-in">
        <div className="skeleton h-4 w-24 mb-3" />
        <div className="skeleton h-8 w-32 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
    )
  }

  const trendPositive = trend && trend.value >= 0

  return (
    <div className="glass-card glass-card-hover p-5 animate-slide-up relative overflow-hidden">
      {/* Background gradient accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl"
        style={{ background: accentColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-[12px] font-semibold text-[#64748b] uppercase tracking-wider">{title}</p>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-[#f8fafc] mb-1 tracking-tight">{value}</p>

      {/* Subtitle + Trend */}
      <div className="flex items-center gap-2">
        {subtitle && <p className="text-[12px] text-[#64748b]">{subtitle}</p>}
        {trend && (
          <span
            className={clsx(
              'text-[11px] font-semibold px-1.5 py-0.5 rounded',
              trendPositive
                ? 'text-[#10b981] bg-[#10b981]/10'
                : 'text-[#ef4444] bg-[#ef4444]/10'
            )}
          >
            {trendPositive ? '▲' : '▼'} {Math.abs(trend.value)}%{trend.label ? ` ${trend.label}` : ''}
          </span>
        )}
      </div>
    </div>
  )
}
