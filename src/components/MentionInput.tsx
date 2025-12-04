'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'

interface User {
  id: string
  name: string
  username: string
  email: string
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function MentionInput({
  value,
  onChange,
  placeholder,
  disabled,
  className = ''
}: MentionInputProps) {
  const [users, setUsers] = useState<User[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mentionQuery, setMentionQuery] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Kullanıcıları yükle
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error)
    }
  }

  // @ karakterinden sonraki metni kontrol et
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const text = value.substring(0, cursorPosition)
    const lastAtIndex = text.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const textAfterAt = text.substring(lastAtIndex + 1)
      
      // @ karakterinden sonra boşluk yoksa ve @ son 20 karakter içindeyse
      if (!textAfterAt.includes(' ') && cursorPosition - lastAtIndex <= 20) {
        setMentionQuery(textAfterAt.toLowerCase())
        
        const filtered = users.filter(user =>
          user.username.toLowerCase().includes(textAfterAt.toLowerCase()) ||
          user.name.toLowerCase().includes(textAfterAt.toLowerCase())
        ).slice(0, 5) // Maksimum 5 öneri
        
        setFilteredUsers(filtered)
        setShowSuggestions(filtered.length > 0)
        setSelectedIndex(0)
      } else {
        setShowSuggestions(false)
      }
    } else {
      setShowSuggestions(false)
    }
  }, [value, cursorPosition, users])

  const insertMention = (username: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const text = value
    const cursorPos = cursorPosition
    
    // @ karakterinin pozisyonunu bul
    const textBeforeCursor = text.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtIndex !== -1) {
      // @'den önceki ve sonraki metni al
      const before = text.substring(0, lastAtIndex)
      const after = text.substring(cursorPos)
      
      // Yeni metni oluştur
      const newText = `${before}@${username} ${after}`
      const newCursorPos = lastAtIndex + username.length + 2 // @ + username + space
      
      onChange(newText)
      setShowSuggestions(false)
      
      // Cursor pozisyonunu güncelle
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        setCursorPosition(newCursorPos)
      }, 0)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        if (filteredUsers[selectedIndex]) {
          e.preventDefault()
          insertMention(filteredUsers[selectedIndex].username)
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        break
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    setCursorPosition(e.target.selectionStart)
  }

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart)
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onClick={handleClick}
        onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto"
          style={{
            bottom: '100%',
            marginBottom: '4px'
          }}
        >
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600 font-medium">
              @ ile kullanıcı etiketle • ↑↓ seç • Enter onaylaa
            </p>
          </div>
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => insertMention(user.username)}
              className={`w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    @{user.username}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
