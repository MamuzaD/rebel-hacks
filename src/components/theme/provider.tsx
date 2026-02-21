import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ResolvedTheme = 'dark' | 'light'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === 'undefined') return defaultTheme
  const raw = localStorage.getItem(storageKey)
  return raw === 'dark' || raw === 'light' || raw === 'system' ? raw : defaultTheme
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'tanstack-ui-theme',
  ...props
}: ThemeProviderProps) {
  // Initialize from localStorage once (SSR-safe). To reset when storageKey/defaultTheme change, use key prop: <ThemeProvider key={`${storageKey}-${defaultTheme}`} />.
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme(storageKey, defaultTheme))
  // Only system preference changes; resolved theme is derived during render.
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme

  // Apply theme to DOM and subscribe to system preference when theme === 'system'
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => setSystemTheme(getSystemTheme())
      mq.addEventListener('change', listener)
      return () => mq.removeEventListener('change', listener)
    }
  }, [theme, resolvedTheme])

  const value = {
    theme,
    resolvedTheme,
    setTheme: (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme)
      setTheme(nextTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  return context
}
