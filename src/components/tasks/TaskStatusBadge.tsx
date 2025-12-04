interface TaskStatusBadgeProps {
  status: string
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      label: '⏳ Bekliyor',
      className: 'bg-yellow-100 text-yellow-900 border-2 border-yellow-400',
      icon: '⏳',
    },
    IN_PROGRESS: {
      label: '🔄 Devam Ediyor',
      className: 'bg-blue-100 text-blue-900 border-2 border-blue-400',
      icon: '🔄',
    },
    COMPLETED: {
      label: '✅ Tamamlandı',
      className: 'bg-green-100 text-green-900 border-2 border-green-500',
      icon: '✅',
    },
    CANCELLED: {
      label: '❌ İptal Edildi',
      className: 'bg-red-100 text-red-900 border-2 border-red-400',
      icon: '❌',
    },
    ON_HOLD: {
      label: '⏸️ Beklemede',
      className: 'bg-gray-100 text-gray-900 border-2 border-gray-400',
      icon: '⏸️',
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

  return (
    <span className={`px-4 py-2 rounded-full text-sm font-bold border shadow-sm ${config.className}`}>
      {config.label}
    </span>
  )
}
