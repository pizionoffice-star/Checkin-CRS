import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { Card, Badge } from '../../components/Layout'
import { FiX } from '../../components/icons'

export default function Plans(){
  const { data, setData, genId } = useData()
  const [form,setForm]=useState({ open:false, mode:'create', editId:null, name:'', price:'', billing:'monthly', maxCustomers:'', maxRewards:'', description:'', features:'' })

  const plans = data.plans || []
  const subs = data.subscriptions

  const openCreate = ()=> setForm({ open:true, mode:'create', editId:null, name:'', price:'', billing:'monthly', maxCustomers:'', maxRewards:'', description:'', features:'' })
  const openEdit = (p)=> setForm({ open:true, mode:'edit', editId:p.id, name:p.name, price:String(p.price), billing:p.billing||'monthly', maxCustomers:String(p.maxCustomers), maxRewards:String(p.maxRewards), description:p.description||'', features:(p.features||[]).join(', ') })

  const save = ()=>{
    if(!form.name.trim()) return alert('Plan name required')
    const maxC = parseInt(form.maxCustomers)
    const maxR = parseInt(form.maxRewards)
    const price = parseFloat(form.price)
    if(isNaN(maxC) || maxC<1) return alert('Max customers must be >=1')
    if(isNaN(maxR) || maxR<1) return alert('Max rewards must be >=1')
    if(isNaN(price) || price<0) return alert('Price must be >=0')

    if(form.mode==='create'){
      if(plans.some(p=> p.name.toLowerCase()===form.name.trim().toLowerCase())) return alert('Plan name already exists')
      const np = {
        id: genId('plan'),
        name: form.name.trim(),
        price,
        billing: form.billing,
        maxCustomers: maxC,
        maxRewards: maxR,
        description: form.description.trim(),
        features: form.features.split(',').map(s=> s.trim()).filter(Boolean),
        highlight: false,
        active: true
      }
      setData(d=> ({...d, plans:[...d.plans, np], activityLogs:[{id:genId('a'), user:'Super Admin', restaurantId:null, action:'Plan created', target:np.name, date:new Date().toISOString()}, ...d.activityLogs]}))
    } else {
      const old = plans.find(p=> p.id===form.editId)
      const oldName = old?.name
      const newName = form.name.trim()
      const updated = {
        ...old,
        name: newName,
        price,
        billing: form.billing,
        maxCustomers: maxC,
        maxRewards: maxR,
        description: form.description.trim(),
        features: form.features.split(',').map(s=> s.trim()).filter(Boolean),
      }
      setData(d=> {
        let restaurants = d.restaurants
        let subscriptions = d.subscriptions
        if(oldName && oldName!==newName){
          restaurants = restaurants.map(r=> r.plan===oldName? {...r, plan:newName}:r)
          subscriptions = subscriptions.map(s=> s.plan===oldName? {...s, plan:newName}:s)
        }
        return {
          ...d,
          plans: d.plans.map(p=> p.id===form.editId? updated : p),
          restaurants,
          subscriptions,
          activityLogs:[{id:genId('a'), user:'Super Admin', restaurantId:null, action:'Plan updated', target:newName, date:new Date().toISOString()}, ...d.activityLogs]
        }
      })
    }
    setForm({...form, open:false})
  }

  const delPlan = (p)=>{
    const usingCount = data.restaurants.filter(r=> r.plan===p.name).length
    if(usingCount>0) return alert(`Cannot delete: ${usingCount} restaurant(s) are on this plan. Reassign them first.`)
    if(!confirm(`Delete plan "${p.name}"?`)) return
    setData(d=> ({...d, plans: d.plans.filter(x=> x.id!==p.id), activityLogs:[{id:genId('a'), user:'Super Admin', restaurantId:null, action:'Plan deleted', target:p.name, date:new Date().toISOString()}, ...d.activityLogs]}))
  }

  const toggleActive = (p)=>{
    setData(d=> ({...d, plans: d.plans.map(x=> x.id===p.id? {...x, active:!x.active}:x)}))
  }

  const assign = (sub, newPlan)=>{
    setData(d=> ({...d, subscriptions: d.subscriptions.map(s=> s.id===sub.id? {...s, plan:newPlan}:s), restaurants: d.restaurants.map(r=> r.id===sub.restaurantId? {...r, plan:newPlan}:r), activityLogs:[{id:genId('a'), user:'Super Admin', restaurantId:sub.restaurantId, action:'Plan changed', target:newPlan, date:new Date().toISOString()}, ...d.activityLogs]}))
  }
  const extend = (sub)=>{
    const d = prompt('New expiry date YYYY-MM-DD', sub.expiryDate)
    if(!d) return
    setData(prev=> ({...prev, subscriptions: prev.subscriptions.map(s=> s.id===sub.id? {...s, expiryDate:d}:s)}))
  }
  const toggleSub = (sub)=>{
    const ns = sub.status==='Active'? 'Suspended':'Active'
    setData(prev=> ({...prev, subscriptions: prev.subscriptions.map(s=> s.id===sub.id? {...s, status:ns}:s), restaurants: prev.restaurants.map(r=> r.id===sub.restaurantId? {...r, status:ns}:r)}))
  }

  return (
    <div>
      <div className="flex-between">
        <h2 className="page-title">Plans & Subscriptions</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Create New Plan</button>
      </div>

      <div className="grid-2" style={{alignItems:'stretch'}}>
        {plans.map(p=>{
          const using = data.restaurants.filter(r=> r.plan===p.name).length
          const totalCustomers = data.customers.filter(c=> {
            const r = data.restaurants.find(x=> x.id===c.restaurantId)
            return r?.plan===p.name
          }).length
          return (
            <Card key={p.id} style={p.highlight? {border:'2px solid #80F800'}: {}}>
              <div className="flex-between">
                <h3 style={{margin:0}}>{p.name} {p.highlight && <span className="badge badge-green" style={{marginLeft:8}}>Popular</span>}</h3>
                <span className={`badge ${p.active?'badge-green':'badge-gray'}`}>{p.active?'Active':'Inactive'}</span>
              </div>
              <div style={{margin:'8px 0', display:'flex', alignItems:'baseline', gap:6}}>
                <span style={{fontSize:28, fontWeight:800}}>{data.platformSettings.currency}{p.price}</span>
                <span className="muted">/ {p.billing}</span>
              </div>
              <p className="muted" style={{fontSize:13, margin:'6px 0'}}>{p.description || 'No description'}</p>

              <div className="plan-limits">
                <div className="limit-box">
                  <div className="limit-value">{p.maxCustomers.toLocaleString()}</div>
                  <div className="limit-label">Max Customers</div>
                  <div className="muted" style={{fontSize:11}}>accounts per restaurant</div>
                </div>
                <div className="limit-box">
                  <div className="limit-value">{p.maxRewards.toLocaleString()}</div>
                  <div className="limit-label">Max Rewards</div>
                  <div className="muted" style={{fontSize:11}}>rewards per restaurant</div>
                </div>
              </div>

              {p.features?.length>0 && (
                <ul style={{margin:'12px 0 0', paddingLeft:18, fontSize:13, lineHeight:1.6}}>
                  {p.features.map((f,i)=> <li key={i}>{f}</li>)}
                </ul>
              )}

              <div className="muted" style={{fontSize:12, marginTop:10}}>
                {using} restaurant(s) on this plan • {totalCustomers} total customer accounts
              </div>

              <div className="btn-row" style={{marginTop:14}}>
                <button className="btn btn-sm" onClick={()=>openEdit(p)}>Edit</button>
                <button className="btn btn-sm btn-ghost" onClick={()=>toggleActive(p)}>{p.active?'Deactivate':'Activate'}</button>
                <button className="btn btn-sm btn-danger" onClick={()=>delPlan(p)}>Delete</button>
              </div>
            </Card>
          )
        })}
        {plans.length===0 && <Card><span className="muted">No plans yet. Create your first plan.</span></Card>}
      </div>

      <Card style={{marginTop:16}}>
        <h3>Subscriptions</h3>
        <p className="muted" style={{fontSize:13}}>Assign plans to restaurants — limits (customers & rewards) are enforced immediately.</p>
        <div className="table-wrap">
        <table className="table"><thead><tr><th>Restaurant</th><th>Plan</th><th>Limits</th><th>Status</th><th>Start</th><th>Expiry</th><th>Actions</th></tr></thead><tbody>
          {subs.map(s=>{
            const r=data.restaurants.find(x=> x.id===s.restaurantId)
            const plan = plans.find(p=> p.name===s.plan)
            const rLabel = r?.name || s.restaurantId
            const usageC = r ? data.customers.filter(c=> c.restaurantId===r.id).length : 0
            const usageR = r ? data.rewards.filter(rw=> rw.restaurantId===r.id).length : 0
            return <tr key={s.id}>
              <td>{rLabel}</td>
              <td><Badge tone={s.plan==='Paid'?'green':'gray'}>{s.plan}</Badge></td>
              <td style={{fontSize:12, lineHeight:1.4}}>
                {plan ? <span>{usageC}/{plan.maxCustomers} customers<br/>{usageR}/{plan.maxRewards} rewards</span> : <span className="muted">No plan</span>}
                {plan && (usageC>=plan.maxCustomers || usageR>=plan.maxRewards) && <span style={{color:'#dc2626', fontWeight:700}}> • Limit reached</span>}
              </td>
              <td><Badge tone={s.status==='Active'?'green':'red'}>{s.status}</Badge></td>
              <td>{s.startDate}</td><td>{s.expiryDate}</td>
              <td>
                <div className="btn-row" style={{flexWrap:'wrap'}}>
                  <select className="input" value={s.plan} onChange={e=>assign(s, e.target.value)} style={{width:140}}>
                    {plans.filter(p=> p.active).map(p=> <option key={p.id} value={p.name}>{p.name} ({p.maxCustomers}c/{p.maxRewards}r)</option>)}
                    {!plans.some(p=> p.name===s.plan) && <option value={s.plan}>{s.plan} (legacy)</option>}
                  </select>
                  <button className="btn btn-sm" onClick={()=>extend(s)}>Extend</button>
                  <button className="btn btn-sm btn-dark" onClick={()=>toggleSub(s)}>{s.status==='Active'? 'Deactivate':'Activate'}</button>
                </div>
              </td>
            </tr>
          })}
        </tbody></table>
        </div>
      </Card>

      {form.open && (
        <div className="modal-overlay" onClick={()=>setForm({...form, open:false})}>
          <div className="modal modal-large" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>{form.mode==='create' ? 'Create New Plan' : 'Edit Plan'}</h3>
              <button className="btn btn-ghost" onClick={()=>setForm({...form, open:false})} aria-label="Close"><FiX size={16} /></button>
            </div>
            <div className="modal-body">
              <p className="muted" style={{fontSize:13, marginTop:0}}>Main controls are <b>number of customer accounts</b> and <b>number of rewards</b> — these limits are enforced for every restaurant on this plan.</p>
              <div className="form grid-2">
                <label>Plan Name*<input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="e.g. Starter"/></label>
                <label>Price ({data.platformSettings.currency})*<input className="input" type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="0"/></label>
                <label>Billing<select className="input" value={form.billing} onChange={e=>setForm({...form, billing:e.target.value})}><option value="monthly">monthly</option><option value="yearly">yearly</option><option value="lifetime">lifetime</option></select></label>
                <label>Status<select className="input" value="active" disabled><option>Active (toggle after create)</option></select></label>
                <label>Max Customer Accounts* <span className="muted" style={{fontWeight:400}}>— main control</span><input className="input" type="number" value={form.maxCustomers} onChange={e=>setForm({...form, maxCustomers:e.target.value})} placeholder="e.g. 100"/></label>
                <label>Max Rewards* <span className="muted" style={{fontWeight:400}}>— main control</span><input className="input" type="number" value={form.maxRewards} onChange={e=>setForm({...form, maxRewards:e.target.value})} placeholder="e.g. 3"/></label>
                <label style={{gridColumn:'1 / -1'}}>Description<input className="input" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Short description"/></label>
                <label style={{gridColumn:'1 / -1'}}>Features (comma separated)<input className="input" value={form.features} onChange={e=>setForm({...form, features:e.target.value})} placeholder="QR loyalty, Points & rewards, Staff accounts"/></label>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={()=>setForm({...form, open:false})}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{form.mode==='create' ? 'Create Plan' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
