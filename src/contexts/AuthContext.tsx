import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiService, { LoginCredentials, RegisterData } from '../services/api'

interface LocalUser {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: LocalUser | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token and get current user
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('taskflow_token')
        if (token) {
          const response = await apiService.getCurrentUser()
          if (response.success && response.data) {
            const apiUser = response.data
            const user: LocalUser = {
              id: apiUser._id,
              name: apiUser.name,
              email: apiUser.email,
              avatar: apiUser.avatar
            }
            setUser(user)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear invalid tokens
        localStorage.removeItem('taskflow_token')
        localStorage.removeItem('taskflow_refresh_token')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const credentials: LoginCredentials = { email, password }
      const response = await apiService.login(credentials)
      
      if (response.success && (response as any).user) {
        const apiUser = (response as any).user
        const user: LocalUser = {
          id: apiUser._id,
          name: apiUser.name,
          email: apiUser.email,
          avatar: apiUser.avatar
        }
        setUser(user)
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const data: RegisterData = { name, email, password }
      const response = await apiService.register(data)
      
      if (response.success && (response as any).user) {
        const apiUser = (response as any).user
        const user: LocalUser = {
          id: apiUser._id,
          name: apiUser.name,
          email: apiUser.email,
          avatar: apiUser.avatar
        }
        setUser(user)
      } else {
        throw new Error(response.message || 'Signup failed')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 