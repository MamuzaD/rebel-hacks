import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './provider'

export function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (resolvedTheme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  const renderIcon = () => {
    switch (resolvedTheme) {
      case 'light':
        return <Sun className="h-[1.2rem] w-[1.2rem]" />
      case 'dark':
        return <Moon className="h-[1.2rem] w-[1.2rem]" />
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {renderIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}