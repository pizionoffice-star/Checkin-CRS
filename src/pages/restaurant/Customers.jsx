import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { Card, Badge } from '../../components/Layout'
import { FiX } from '../../components/icons'

export default function Customers(){
  const { data, setData, genId } = useData()
  const { session } = useAuth()
  const rid = session.restaurantId
  const [search,setSearch]=useState('')
  const [selected,setSelected]=useState(null)
  const [adjust,setAdjust]=useState({ open:false, type:'add', points:'', reason:'' })
  const isStaff = session.role==='staff'

  const customers = data.customers.filter(c=> c.restaurantId===rid && ( !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)))

  const openAdjust = (customer, type)=> { setSelected(customer); setAdjust({ open:true, type, points:'', reason:'' }) }

  const handleAdjust = ()=>{
    const pts = parseInt(adjust.points)
    if(!pts || pts<=0) return alert('Enter valid points')
    if(!adjust.reason.trim()) return alert('Reason required')
    const now = new Date().toISOString()
    setData(d=>{
      const cust = d.customers.find(c=> c.id===selected.id)
      if(adjust.type==='add') cust.currentPoints += pts
      else {
        if(cust.currentPoints < pts) { alert('Insufficient points'); return d }
        cust.currentPoints -= pts
      }
      const tx = { id: genId('pt'), restaurantId: rid, customerId: cust.id, type: adjust.type==='add'? 'Manual addition':'Manual deduction', points: adjust.type==='add'? pts : -pts, reason: adjust.reason, date: now }
      const log = { id: genId('a'), user: session.name, restaurantId: rid, action: adjust.type==='add'? 'Points manually added':'Points manually deducted', target: `${cust.name} ${adjust.type==='add'? '+': '-'}${pts} (${adjust.reason})`, date: now }
      return { ...d, pointTransactions:[tx, ...d.pointTransactions], activityLogs:[log, ...d.activityLogs] }
    })
    setAdjust({...adjust, open:false}); setSelected({...selected, currentPoints: adjust.type==='add'? selected.currentPoints+pts : selected.currentPoints-pts})
  }

  const redeem = (reward)=>{
    if(selected.currentPoints < reward.requiredPoints) return alert('Not enough points')
    if(!confirm(`Redeem ${reward.name} for ${reward.requiredPoints} points?`)) return
    const now = new Date().toISOString()
    setData(d=>{
      const cust = d.customers.find(c=> c.id===selected.id)
      cust.currentPoints -= reward.requiredPoints
      const redemption = { id: genId('rd'), restaurantId: rid, customerId: cust.id, rewardId: reward.id, pointsUsed: reward.requiredPoints, date: now, status:'Completed' }
      const tx = { id: genId('pt'), restaurantId: rid, customerId: cust.id, type:'Reward redemption', points: -reward.requiredPoints, reason: `Redeemed ${reward.name}`, date: now }
      const log = { id: genId('a'), user: session.name, restaurantId: rid, action:'Reward redeemed', target: `${cust.name} → ${reward.name}`, date: now }
      return { ...d, redemptions:[redemption, ...d.redemptions], pointTransactions:[tx, ...d.pointTransactions], activityLogs:[log, ...d.activityLogs] }
    })
    setSelected({...selected, currentPoints: selected.currentPoints - reward.requiredPoints})
  }

  const editName = ()=>{
    const newName = prompt('New name', selected.name)
    if(!newName) return
    setData(d=> ({...d, customers: d.customers.map(c=> c.id===selected.id? {...c, name:newName}:c)}))
    setSelected({...selected, name:newName})
  }

  const rewards = data.rewards.filter(r=> r.restaurantId===rid && r.active)
  const transactions = data.pointTransactions.filter(t=> selected && t.customerId===selected.id).sort((a,b)=> new Date(b.date)-new Date(a.date))
  const visits = data.visits.filter(v=> selected && v.customerId===selected.id).sort((a,b)=> new Date(b.date+' '+b.time)-new Date(a.date+' '+a.time))
  const redemptions = data.redemptions.filter(r=> selected && r.customerId===selected.id)

  return (
    <div>
      <h2 className="page-title">Customers</h2>
      <div className="toolbar">
        <input className="input" placeholder="Search name or phone" value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:320}}/>
        <span className="muted">{customers.length} customers</span>
      </div>
      <Card>
        <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Phone</th><th>Visits</th><th>Points</th><th>Last Visit</th><th>Actions</th></tr></thead>
          <tbody>
            {customers.map(c=>(
              <tr key={c.id}>
                <td>{c.name}</td><td>{c.phone}</td><td>{c.totalVisits}</td><td><Badge tone="green">{c.currentPoints}</Badge></td><td>{c.lastVisitAt? new Date(c.lastVisitAt).toLocaleDateString(): '-'}</td>
                <td><button className="btn btn-sm btn-dark" onClick={()=>setSelected(c)}>View</button></td>
              </tr>
            ))}
            {customers.length===0 && <tr><td colSpan={6} className="muted">No customers</td></tr>}
          </tbody>
        </table>
        </div>
      </Card>

      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>{selected.name} <small className="muted">{selected.phone}</small></h3>
              <button className="btn btn-ghost" onClick={()=>setSelected(null)} aria-label="Close"><FiX size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="grid-3">
                <div className="kpi"><b>{selected.currentPoints}</b><span>Current Points</span></div>
                <div className="kpi"><b>{selected.totalVisits}</b><span>Total Visits</span></div>
                <div className="kpi"><b>{new Date(selected.createdAt).toLocaleDateString()}</b><span>Joined</span></div>
              </div>
              <div className="btn-row" style={{margin:'12px 0'}}>
                <button className="btn btn-sm" onClick={editName}>Edit Name</button>
                <button className="btn btn-sm btn-primary" onClick={()=>openAdjust(selected,'add')}>+ Add Points</button>
                <button className="btn btn-sm btn-dark" onClick={()=>openAdjust(selected,'deduct')}>− Deduct Points</button>
              </div>

              <h4>Available Rewards</h4>
              <div className="rewards-grid">
                {rewards.map(r=>{
                  const can = selected.currentPoints >= r.requiredPoints
                  return <div key={r.id} className={`reward-card ${can?'can':''}`} style={{padding:12}}>
                    <b>{r.name}</b> <span className="muted">{r.requiredPoints} pts</span>
                    <div style={{marginTop:6}}><button disabled={!can} className={`btn btn-sm ${can?'btn-primary':''}`} onClick={()=>redeem(r)}>{can?'Redeem':'Need '+(r.requiredPoints-selected.currentPoints)+' more'}</button></div>
                  </div>
                })}
                {rewards.length===0 && <span className="muted">No active rewards</span>}
              </div>

              <h4 style={{marginTop:16}}>Visit History</h4>
              <table className="table small"><thead><tr><th>Date</th><th>Points</th></tr></thead><tbody>{visits.map(v=> <tr key={v.id}><td>{v.date} {v.time}</td><td>+{v.pointsEarned}</td></tr>)} {visits.length===0 && <tr><td colSpan={2} className="muted">No visits</td></tr>}</tbody></table>

              <h4>Point Transactions</h4>
              <table className="table small"><thead><tr><th>Type</th><th>Points</th><th>Reason</th><th>Date</th></tr></thead><tbody>{transactions.map(t=> <tr key={t.id}><td>{t.type}</td><td style={{color: t.points>0?'#16a34a':'#dc2626'}}>{t.points>0? '+'+t.points : t.points}</td><td>{t.reason}</td><td>{new Date(t.date).toLocaleString()}</td></tr>)} {transactions.length===0 && <tr><td colSpan={4} className="muted">No transactions</td></tr>}</tbody></table>

              <h4>Redemptions</h4>
              <table className="table small"><thead><tr><th>Reward</th><th>Points Used</th><th>Date</th></tr></thead><tbody>{redemptions.map(rd=>{ const rw=data.rewards.find(x=> x.id===rd.rewardId); return <tr key={rd.id}><td>{rw?.name}</td><td>{rd.pointsUsed}</td><td>{new Date(rd.date).toLocaleDateString()}</td></tr>})}{redemptions.length===0 && <tr><td colSpan={3} className="muted">None</td></tr>}</tbody></table>
            </div>
          </div>
        </div>
      )}

      {adjust.open && (
        <div className="modal-overlay" onClick={()=>setAdjust({...adjust, open:false})}>
          <div className="modal small" onClick={e=>e.stopPropagation()}>
            <h3>{adjust.type==='add'? 'Add Points':'Deduct Points'}</h3>
            <div className="form">
              <label>Points<input className="input" type="number" value={adjust.points} onChange={e=>setAdjust({...adjust, points:e.target.value})} placeholder="e.g. 50"/></label>
              <label>Reason *<input className="input" value={adjust.reason} onChange={e=>setAdjust({...adjust, reason:e.target.value})} placeholder="Reason required"/></label>
              <div className="btn-row">
                <button className="btn btn-primary" onClick={handleAdjust}>Confirm</button>
                <button className="btn btn-ghost" onClick={()=>setAdjust({...adjust, open:false})}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
