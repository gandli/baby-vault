import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  familyId?: string
  babyName?: string
  babyBirthday?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType>(null!)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('babyvault_user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('babyvault_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('babyvault_user')
    }
  }, [user])

  const login = (email: string) => {
    // MVP: simple local auth, no real OTP yet
    setUser({ id: crypto.randomUUID(), email })
  }

  const logout = () => setUser(null)

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
