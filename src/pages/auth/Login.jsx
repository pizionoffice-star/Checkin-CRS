import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { FiCheckCircle, FiArrowRight, FiZap } from '../../components/icons'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState('')
  const { login } = useAuth()
  const { data } = useData()
  const platformName = data.platformSettings?.platformName || 'CRS Loyalty'
  const platformTagline = data.platformSettings?.platformTagline || 'Retention SaaS'
  const platformLogo = data.platformSettings?.platformLogo || ''
  const isImageLogo = platformLogo.startsWith('data:image')
  const navigate = useNavigate()
  useEffect(()=> { document.title = `${platformName} — ${platformTagline}` }, [platformName, platformTagline])

  const handle = (e)=>{
    e.preventDefault()
    const res = login(email.trim(), password)
    if(!res.ok){ setErr(res.error); return }
    if(res.session.role==='superadmin') navigate('/super/dashboard')
    else navigate('/app/dashboard')
  }

  const fill = (e,p)=>{ setEmail(e); setPassword(p)}

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <div className="login-brand">
            {isImageLogo ? <img src={platformLogo} alt="logo" style={{width:28,height:28,borderRadius:8,objectFit:'cover',background:'#fff'}}/> : <span className="dot" style={{display:'inline-flex',alignItems:'center',justifyContent:'center'}}><FiZap size={14} /></span>}
            {platformName}
          </div>
          <div className="muted" style={{fontSize:12, opacity:.8, marginBottom:8}}>{platformTagline}</div>
          <h1>Grow repeat customers with a simple QR loyalty loop</h1>
          <p style={{display:'flex',alignItems:'center',gap:4,flexWrap:'wrap'}}>Scan <FiArrowRight size={12} /> Join <FiArrowRight size={12} /> Earn <FiArrowRight size={12} /> Redeem <FiArrowRight size={12} /> Return. Built for restaurants that want retention without complexity.</p>
          <ul className="feature-list">
            <li><FiCheckCircle size={14} /> QR-based visit tracking</li>
            <li><FiCheckCircle size={14} /> Points & rewards in one click</li>
            <li><FiCheckCircle size={14} /> Social follow + review growth</li>
          </ul>
        </div>
        <div className="login-right">
          <h2>Sign in</h2>
          <p className="muted">Use demo accounts below. No password required beyond listed.</p>
          <form onSubmit={handle} className="form">
            <label>Email<input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" required/></label>
            <label>Password<input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" required/></label>
            {err && <div className="alert error">{err}</div>}
            <button className="btn btn-primary w-full" type="submit">Sign In</button>
          </form>

          <div className="demo-grid">
            <button className="demo-btn" onClick={()=>fill('super@admin.com','super123')}>
              <b>Super Admin</b><span>super@admin.com / super123</span>
            </button>
            <button className="demo-btn" onClick={()=>fill('admin@burgerhub.com','admin123')}>
              <b>Burger Hub Admin</b><span>admin@burgerhub.com / admin123</span>
            </button>
            <button className="demo-btn" onClick={()=>fill('staff@burgerhub.com','staff123')}>
              <b>Staff (Burger Hub)</b><span>staff@burgerhub.com / staff123</span>
            </button>
            <button className="demo-btn" onClick={()=>fill('admin@spiceroute.com','admin123')}>
              <b>Spice Route Admin</b><span>admin@spiceroute.com / admin123</span>
            </button>
          </div>
          <div style={{marginTop:16, textAlign:'center'}}>
            <Link to="/r/r1" className="link" style={{display:'inline-flex',alignItems:'center',gap:6}}><FiArrowRight size={14} /> Try Customer QR page (Burger Hub)</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
