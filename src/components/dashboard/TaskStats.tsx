import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react'

interface TaskStatsProps {
  total: number
  pending: number
  inProgress: number
  completed: number
}

export function TaskStats({ total, pending, inProgress, completed }: TaskStatsProps) {
  const stats = [
    {
      label: 'Toplam Görev',
      value: total,
      icon: ListTodo,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Bekleyen',
      value: pending,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Devam Eden',
      value: inProgress,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Tamamlanan',
      value: completed,
      icon: CheckCircle2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800 font-bold mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={stat.textColor} size={24} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
