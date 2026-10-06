import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { Card, Badge } from '../../components/Layout'

export default function Rewards(){
  const { data, setData, genId } = useData()
  const { session } = useAuth()
  const rid = session.restaurantId
  const isStaff = session.role==='staff'
  const [form,setForm]=useState({ open:false, edit:null, name:'', description:'', requiredPoints:'', type:'Free item', discountAmount:'', active:true })

  const rewards = data.rewards.filter(r=> r.restaurantId===rid)
  const restaurant = data.restaurants.find(r=> r.id===rid)
  const plan = data.plans?.find(p=> p.name===restaurant?.plan)
  const maxRewards = plan?.maxRewards ?? 3
  const atLimit = !form.edit && rewards.length >= maxRewards

  const openCreate = ()=> {
    if(atLimit) return alert(`Reward limit reached for ${plan?.name||'current'} plan (${maxRewards} rewards). Upgrade plan to create more.`)
    setForm({ open:true, edit:null, name:'', description:'', requiredPoints:'', type:'Free item', discountAmount:'', active:true })
  }
  const openEdit = (r)=> setForm({ open:true, edit:r.id, name:r.name, description:r.description, requiredPoints:r.requiredPoints, type:r.type, discountAmount:r.discountAmount, active:r.active })

  const save = ()=>{
    if(!form.name || !form.requiredPoints) return alert('Name and points required')
    if(isStaff) return alert('Staff cannot manage rewards')
    if(!form.edit && rewards.length >= maxRewards){
      return alert(`Reward limit reached for ${plan?.name||'current'} plan (${maxRewards} rewards). Upgrade plan to create more.`)
    }
    const payload = { name:form.name, description:form.description, requiredPoints: parseInt(form.requiredPoints), type:form.type, discountAmount: parseInt(form.discountAmount||0), active:form.active }
    if(form.edit){
      setData(d=> ({...d, rewards: d.rewards.map(r=> r.id===form.edit? {...r, ...payload}: r), activityLogs:[{id:genId('a'), user:session.name, restaurantId:rid, action:'Reward updated', target:payload.name, date:new Date().toISOString()}, ...d.activityLogs]}))
    } else {
      const nr = { id: genId('rw'), restaurantId: rid, ...payload, createdAt: new Date().toISOString() }
      setData(d=> ({...d, rewards:[nr, ...d.rewards], activityLogs:[{id:genId('a'), user:session.name, restaurantId:rid, action:'Reward created', target:payload.name, date:new Date().toISOString()}, ...d.activityLogs]}))
    }
    setForm({...form, open:false})
  }

  const toggleActive = (r)=>{
    if(isStaff) return alert('Staff cannot manage rewards')
    setData(d=> ({...d, rewards: d.rewards.map(x=> x.id===r.id? {...x, active:!x.active}:x)}))
  }

  const redemptions = data.redemptions.filter(r=> r.restaurantId===rid).slice(0,10)

  return (
    <div>
      <div className="flex-between"><h2 className="page-title">Rewards</h2>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <span className="muted" style={{fontSize:12}}>{rewards.length}/{maxRewards} rewards used • Plan: {plan?.name||'—'}</span>
          {!isStaff && <button className="btn btn-primary" onClick={openCreate} disabled={atLimit} title={atLimit? `Limit ${maxRewards} reached`:''} style={atLimit?{opacity:.6,cursor:'not-allowed'}:{}}>+ Create Reward</button>}
        </div>
      </div>
      {atLimit && <div className="alert error" style={{marginBottom:12}}>Reward limit reached for {plan?.name} plan ({maxRewards} rewards). Upgrade plan to add more.</div>}
      <div className="grid-2">
        {rewards.map(r=>(
          <Card key={r.id}>
            <div className="flex-between"><b>{r.name}</b><Badge tone={r.active?'green':'gray'}>{r.active?'Active':'Inactive'}</Badge></div>
            <div className="muted" style={{margin:'6px 0'}}>{r.description}</div>
            <div><b>{r.requiredPoints} pts</b> • {r.type} {r.type==='Fixed discount' && `• ৳${r.discountAmount} off`}</div>
            <div className="btn-row" style={{marginTop:10}}>
              {!isStaff && <>
                <button className="btn btn-sm" onClick={()=>openEdit(r)}>Edit</button>
                <button className="btn btn-sm btn-dark" onClick={()=>toggleActive(r)}>{r.active?'Deactivate':'Activate'}</button>
              </>}
            </div>
          </Card>
        ))}
        {rewards.length===0 && <Card><span className="muted">No rewards yet. Create your first reward.</span></Card>}
      </div>

      <Card style={{marginTop:16}}>
        <h3>Recent Redemptions</h3>
        <table className="table"><thead><tr><th>Customer</th><th>Reward</th><th>Points</th><th>Date</th></tr></thead><tbody>
          {redemptions.map(rd=>{
            const c=data.customers.find(x=> x.id===rd.customerId)
            const rw=data.rewards.find(x=> x.id===rd.rewardId)
            return <tr key={rd.id}><td>{c?.name}</td><td>{rw?.name}</td><td>{rd.pointsUsed}</td><td>{new Date(rd.date).toLocaleDateString()}</td></tr>
          })}
          {redemptions.length===0 && <tr><td colSpan={4} className="muted">No redemptions</td></tr>}
        </tbody></table>
      </Card>

      {form.open && (
        <div className="modal-overlay" onClick={()=>setForm({...form, open:false})}>
          <div className="modal small" onClick={e=>e.stopPropagation()}>
            <h3>{form.edit? 'Edit Reward':'Create Reward'}</h3>
            <div className="form">
              <label>Name<input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/></label>
              <label>Description<input className="input" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/></label>
              <label>Required Points<input className="input" type="number" value={form.requiredPoints} onChange={e=>setForm({...form, requiredPoints:e.target.value})}/></label>
              <label>Type<select className="input" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}><option>Free item</option><option>Fixed discount</option></select></label>
              {form.type==='Fixed discount' && <label>Discount Amount (৳)<input className="input" type="number" value={form.discountAmount} onChange={e=>setForm({...form, discountAmount:e.target.value})}/></label>}
              <label className="checkbox"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})}/> Active</label>
              <div className="btn-row"><button className="btn btn-primary" onClick={save}>Save</button><button className="btn btn-ghost" onClick={()=>setForm({...form, open:false})}>Cancel</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
