import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { FiZap, FiMenu } from './icons'

export function AppLayout({ sidebar, children }){
  const [open, setOpen] = useState(false)
  const { session, logout } = useAuth()
  const { data } = useData()
  const navigate = useNavigate()
  const platformName = data.platformSettings?.platformName || 'CRS Loyalty'
  const platformTagline = data.platformSettings?.platformTagline || 'Retention SaaS'
  const platformLogo = data.platformSettings?.platformLogo || ''
  const isImageLogo = platformLogo.startsWith('data:image')
  useEffect(()=> { document.title = `${platformName} — ${platformTagline}` }, [platformName, platformTagline])
  const handleLogout = ()=>{ logout(); navigate('/login')}
  return (
    <div className="app-layout">
      <aside className={`sidebar ${open?'open':''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo" style={isImageLogo? {padding:0, overflow:'hidden', background:'#fff'}:{}}>
            {isImageLogo ? <img src={platformLogo} alt="logo" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <FiZap size={18} />}
          </div>
          <div><div className="brand-name">{platformName}</div><div className="brand-sub">{platformTagline}</div></div>
        </div>
        <nav className="sidebar-nav">
          {sidebar.map(item=>(
            <NavLink key={item.path} to={item.path} className={({isActive})=> isActive? 'nav-item active':'nav-item'}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{session?.name?.[0]||'U'}</div>
            <div><div className="u-name">{session?.name}</div><div className="u-role">{session?.role}</div></div>
          </div>
          <button className="btn btn-dark w-full" onClick={handleLogout}>Logout</button>
          {session?.impersonated && <button className="btn btn-ghost w-full" onClick={()=>{logout(); navigate('/login')}} style={{marginTop:8}}>Exit Impersonation</button>}
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <button className="hamburger" onClick={()=>setOpen(!open)} aria-label="Menu"><FiMenu size={18} /></button>
          <div className="topbar-right">
            <span className="topbar-chip">{session?.email}</span>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
      {open && <div className="sidebar-overlay" onClick={()=>setOpen(false)}></div>}
    </div>
  )
}

export function Card({ children, className='', ...props }){
  return <div className={`card ${className}`} {...props}>{children}</div>
}
export function StatCard({ label, value, sub, icon }){
  return <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
}

export function Badge({ children, tone='default'}){
  return <span className={`badge badge-${tone}`}>{children}</span>
}
