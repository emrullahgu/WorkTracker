'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { LayoutDashboard, ListTodo, BarChart3, LogOut, User, UserCog, Users, Calendar } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/tasks', label: 'Görevler', icon: ListTodo },
    { href: '/dashboard/calendar', label: 'Takvim', icon: Calendar },
    { href: '/dashboard/analytics', label: 'Analitik', icon: BarChart3 },
    ...(session?.user?.role === 'admin' ? [
      { href: '/dashboard/users', label: 'Kullanıcılar', icon: Users },
    ] : []),
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/kobinerji_logo.png" 
                alt="KOBİNERJİ Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Kobinerji
              </span>
              <span className="text-sm text-gray-800 font-bold">Görev Takip</span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-bold ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/profile"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                pathname === '/dashboard/profile'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserCog size={18} />
              <span className="text-sm font-medium">{session?.user?.name}</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <LogOut size={18} />
              <span className="text-sm">Çıkış</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
