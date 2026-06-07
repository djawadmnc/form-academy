// Form Academy — Authentication Context
// Provides currentUser (Firebase Auth), userDoc (Firestore users/{uid}), and loading state.
// Wrap the entire app in <AuthProvider> so any component can call useAuth().

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../firebase'
import { getUser } from '../db/users'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)  // Firebase Auth user
  const [userDoc, setUserDoc]         = useState(null)  // Firestore users/{uid}
  const [loading, setLoading]         = useState(true)  // true until first auth check resolves

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser)

      if (firebaseUser) {
        try {
          const doc = await getUser(firebaseUser.uid)
          setUserDoc(doc)
        } catch (err) {
          setUserDoc(null)
        }
      } else {
        setUserDoc(null)
      }

      setLoading(false)
    })

    return unsubscribe // cleanup on unmount
  }, [])

  async function signOut() {
    await firebaseSignOut(auth)
    setCurrentUser(null)
    setUserDoc(null)
  }

  const value = { currentUser, userDoc, loading, signOut }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook — use inside any component: const { currentUser, userDoc } = useAuth()
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
