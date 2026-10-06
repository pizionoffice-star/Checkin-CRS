import React, { useState, useEffect } from 'react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { Card } from '../../components/Layout'

export default function LoyaltyProgram(){
  const { data, setData, genId } = useData()
  const { session } = useAuth()
  const rid = session.restaurantId
  const restaurant = data.restaurants.find(r=> r.id===rid)
  const [form,setForm]=useState({ welcomeBonus: restaurant.loyalty?.welcomeBonus ?? 100, pointsPerVisit: restaurant.loyalty?.pointsPerVisit ?? 50, minBill: restaurant.loyalty?.minBill ?? 0, maxScansPerDay: restaurant.loyalty?.maxScansPerDay ?? 1 })
  useEffect(()=> setForm({ welcomeBonus: restaurant.loyalty?.welcomeBonus ?? 100, pointsPerVisit: restaurant.loyalty?.pointsPerVisit ?? 50, minBill: restaurant.loyalty?.minBill ?? 0, maxScansPerDay: restaurant.loyalty?.maxScansPerDay ?? 1 }), [restaurant])
  const isStaff = session.role==='staff'
  const save = ()=>{
    if(isStaff) return alert('Staff cannot change loyalty settings')
    const maxScans = parseInt(form.maxScansPerDay)
    if(isNaN(maxScans) || maxScans<1 || maxScans>10) return alert('Max scans per day must be between 1 and 10')
    setData(d=> ({...d, restaurants: d.restaurants.map(r=> r.id===rid? {...r, loyalty:{ welcomeBonus: parseInt(form.welcomeBonus)||0, pointsPerVisit: parseInt(form.pointsPerVisit)||0, minBill: parseInt(form.minBill)||0, maxScansPerDay: maxScans } }:r), activityLogs:[{id:genId('a'), user:session.name, restaurantId:rid, action:'Loyalty settings changed', target: `Welcome ${form.welcomeBonus} Visit ${form.pointsPerVisit} Scans/day ${maxScans}`, date:new Date().toISOString()}, ...d.activityLogs]}))
    alert('Saved!')
  }
  return (
    <div>
      <h2 className="page-title">Loyalty Program</h2>
      <Card>
        <div className="form" style={{maxWidth:520}}>
          <label>Welcome Bonus Points<input className="input" type="number" value={form.welcomeBonus} onChange={e=>setForm({...form, welcomeBonus:e.target.value})} disabled={isStaff}/></label>
          <label>Points Per Visit<input className="input" type="number" value={form.pointsPerVisit} onChange={e=>setForm({...form, pointsPerVisit:e.target.value})} disabled={isStaff}/></label>
          <label>Minimum Bill Amount (৳) — optional<input className="input" type="number" value={form.minBill} onChange={e=>setForm({...form, minBill:e.target.value})} disabled={isStaff}/></label>
          <label>Max QR scans per customer per day*<input className="input" type="number" min="1" max="10" value={form.maxScansPerDay} onChange={e=>setForm({...form, maxScansPerDay:e.target.value})} disabled={isStaff}/><small className="muted">How many times a day can the same phone number scan & earn points? (1–10, default 1). Extra scans same day are blocked.</small></label>
          {isStaff? <div className="alert">Staff cannot change loyalty settings</div> : <button className="btn btn-primary" onClick={save}>Save Settings</button>}
          <div className="alert" style={{marginTop:12, background:'#f5f5f5', border:'1px solid #e5e5e5'}}>Example: Welcome 100 pts, Visit 50 pts, 1 scan/day, 500 pts = Free Burger, 800 pts = ৳200 discount</div>
        </div>
      </Card>
    </div>
  )
}
