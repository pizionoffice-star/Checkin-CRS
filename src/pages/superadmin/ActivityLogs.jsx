import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { Card } from '../../components/Layout'

export default function ActivityLogs(){
  const { data } = useData()
  const [q,setQ]=useState('')
  const list = data.activityLogs.filter(l=> !q || l.action.toLowerCase().includes(q.toLowerCase()) || l.target.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <h2 className="page-title">Activity Logs</h2>
      <div className="toolbar"><input className="input" placeholder="Search action or target" value={q} onChange={e=>setQ(e.target.value)} style={{maxWidth:320}}/></div>
      <Card>
        <div className="table-wrap">
        <table className="table"><thead><tr><th>User</th><th>Restaurant</th><th>Action</th><th>Target</th><th>Date</th></tr></thead><tbody>
          {list.map(l=>{
            const r=data.restaurants.find(x=> x.id===l.restaurantId)
            return <tr key={l.id}><td>{l.user}</td><td>{r? r.name : '—'}</td><td>{l.action}</td><td>{l.target}</td><td>{new Date(l.date).toLocaleString()}</td></tr>
          })}
          {list.length===0 && <tr><td colSpan={5} className="muted">No logs</td></tr>}
        </tbody></table>
        </div>
      </Card>
    </div>
  )
}
