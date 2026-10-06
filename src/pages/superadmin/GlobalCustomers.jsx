import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { Card } from '../../components/Layout'

export default function GlobalCustomers(){
  const { data } = useData()
  const [q,setQ]=useState('')
  const list = data.customers.filter(c=>{
    if(!q) return true
    return c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
  })
  return (
    <div>
      <h2 className="page-title">Global Customers</h2>
      <div className="toolbar"><input className="input" placeholder="Search name or phone" value={q} onChange={e=>setQ(e.target.value)} style={{maxWidth:320}}/><span className="muted">{list.length} customers</span></div>
      <Card>
        <div className="table-wrap">
        <table className="table"><thead><tr><th>Customer</th><th>Phone</th><th>Restaurant</th><th>Visits</th><th>Points</th><th>Last Visit</th><th>Created</th></tr></thead><tbody>
          {list.map(c=>{
            const r=data.restaurants.find(x=> x.id===c.restaurantId)
            return <tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td>{r?.name || '—'}</td><td>{c.totalVisits}</td><td>{c.currentPoints}</td><td>{c.lastVisitAt? new Date(c.lastVisitAt).toLocaleDateString(): '-'}</td><td>{new Date(c.createdAt).toLocaleDateString()}</td></tr>
          })}
          {list.length===0 && <tr><td colSpan={7} className="muted">No customers</td></tr>}
        </tbody></table>
        </div>
      </Card>
    </div>
  )
}
