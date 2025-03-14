'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="w-16 h-16 flex flex-col items-center justify-center rounded-lg border-1"
    >
      {theme === 'light' ? (
        <Moon size={24} className="text-primary" />
      ) : (
        <Sun size={24} className="text-primary" />
      )}
      <span className="text-primary text-sm">{theme === 'light' ? 'Dark' : 'Light'}</span>
    </Button>
  )
}
