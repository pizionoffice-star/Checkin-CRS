import React, { createContext, useContext, useState, useEffect } from 'react'
import { loadStore } from '../data/store'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const SESSION_KEY = 'crs_session'

export function AuthProvider({ children }){
  const [session, setSession] = useState(()=>{
    try{ const s=localStorage.getItem(SESSION_KEY); return s? JSON.parse(s): null }catch{return null}
  })

  useEffect(()=> {
    if(session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_KEY)
  }, [session])

  const login = (email, password) => {
    const store = loadStore()
    // super admin hardcoded
    if(email==='super@admin.com' && password==='super123'){
      const s = { role:'superadmin', email, name:'Super Admin' }
      setSession(s); return { ok:true, session:s }
    }
    // restaurant admin
    const rest = store.restaurants.find(r=> r.adminEmail===email && r.password===password)
    if(rest){
      const s = { role:'restaurant_admin', email, restaurantId: rest.id, name: rest.adminName }
      setSession(s); return { ok:true, session:s }
    }
    // staff
    const staff = store.staff.find(s=> s.email===email && s.password===password)
    if(staff){
      const s = { role:'staff', email, restaurantId: staff.restaurantId, name: staff.name, staffId: staff.id }
      setSession(s); return { ok:true, session:s }
    }
    return { ok:false, error:'Invalid credentials' }
  }

  const logout = () => setSession(null)

  const impersonate = (restaurantId) => {
    const store = loadStore()
    const rest = store.restaurants.find(r=> r.id===restaurantId)
    if(!rest) return
    const s = { role:'restaurant_admin', email: rest.adminEmail, restaurantId: rest.id, name: rest.adminName, impersonated:true }
    setSession(s)
  }

  return <AuthContext.Provider value={{ session, login, logout, impersonate, setSession }}>{children}</AuthContext.Provider>
}
