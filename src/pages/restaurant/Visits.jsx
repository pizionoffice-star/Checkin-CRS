import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { Card } from '../../components/Layout'

export default function Visits(){
  const { data } = useData()
  const { session } = useAuth()
  const rid = session.restaurantId
  const [q,setQ]=useState('')
  const visits = data.visits.filter(v=> v.restaurantId===rid).filter(v=>{
    if(!q) return true
    const c = data.customers.find(c=> c.id===v.customerId)
    return c && (c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q))
  })
  return (
    <div>
      <h2 className="page-title">Visits</h2>
      <div className="toolbar">
        <input className="input" placeholder="Search customer" value={q} onChange={e=>setQ(e.target.value)} style={{maxWidth:320}}/>
        <span className="muted">{visits.length} visits</span>
      </div>
      <Card>
        <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Customer</th><th>Date</th><th>Time</th><th>Points</th><th>Staff</th></tr></thead>
          <tbody>
            {visits.map(v=>{
              const c=data.customers.find(x=> x.id===v.customerId)
              const s=data.staff.find(x=> x.id===v.staffId)
              return <tr key={v.id}><td>{c?.name}<br/><small className="muted">{c?.phone}</small></td><td>{v.date}</td><td>{v.time}</td><td>+{v.pointsEarned}</td><td>{s?.name || '—'}</td></tr>
            })}
            {visits.length===0 && <tr><td colSpan={5} className="muted">No visits</td></tr>}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  )
}
