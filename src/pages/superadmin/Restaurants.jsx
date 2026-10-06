import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { Card, Badge } from '../../components/Layout'
import { useNavigate } from 'react-router-dom'
import { RestaurantLogo, handleLogoFile } from '../../utils/logo'
import { FiX, FiCheck } from '../../components/icons'

export default function Restaurants(){
  const { data, setData, genId } = useData()
  const { impersonate } = useAuth()
  const navigate = useNavigate()
  const [q,setQ]=useState('')
  const [form,setForm]=useState({ open:false, name:'', address:'', phone:'', email:'', adminName:'', adminEmail:'', password:'', plan:'Free', status:'Active', logo:'' })
  const [detail,setDetail]=useState(null)
  const [editForm,setEditForm]=useState(null)

  const filtered = data.restaurants.filter(r=> !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.email.toLowerCase().includes(q.toLowerCase()))

  const create = ()=>{
    if(!form.name || !form.email || !form.adminEmail || !form.password) return alert('Fill required fields')
    const id = genId('r')
    const nr = { id, name:form.name, logo:form.logo, address:form.address, phone:form.phone, email:form.email, adminName:form.adminName, adminEmail:form.adminEmail, password:form.password, plan:form.plan, status:form.status, createdAt:new Date().toISOString(), loyalty:{ welcomeBonus: data.platformSettings.defaultWelcomePoints, pointsPerVisit: data.platformSettings.defaultVisitPoints, minBill: data.platformSettings.defaultMinBill, maxScansPerDay: data.platformSettings.defaultMaxScansPerDay ?? 1 }, social:{ facebook:'', instagram:'', tiktok:'', googleMaps:'' }, welcomeMessage:`Welcome to ${form.name}! Collect points on every visit.` }
    setData(d=> ({...d, restaurants:[...d.restaurants, nr], subscriptions:[{id:genId('sub'), restaurantId:id, plan:form.plan, status:form.status, startDate:new Date().toISOString().slice(0,10), expiryDate:'2027-01-01'}, ...d.subscriptions], activityLogs:[{id:genId('a'), user:'Super Admin', restaurantId:id, action:'Restaurant created', target:form.name, date:new Date().toISOString()}, ...d.activityLogs]}))
    setForm({ open:false, name:'', address:'', phone:'', email:'', adminName:'', adminEmail:'', password:'', plan:'Free', status:'Active', logo:'' })
  }

  const toggleStatus = (r)=>{
    const ns = r.status==='Active'? 'Suspended':'Active'
    setData(d=> ({...d, restaurants: d.restaurants.map(x=> x.id===r.id? {...x, status:ns}:x), activityLogs:[{id:genId('a'), user:'Super Admin', restaurantId:r.id, action: ns==='Suspended'? 'Restaurant suspended':'Restaurant activated', target:r.name, date:new Date().toISOString()}, ...d.activityLogs]}))
  }
  const del = (r)=>{
    if(!confirm('Delete restaurant and all its data?')) return
    setData(d=> ({...d, restaurants: d.restaurants.filter(x=> x.id!==r.id), customers: d.customers.filter(c=> c.restaurantId!==r.id), visits: d.visits.filter(v=> v.restaurantId!==r.id), rewards: d.rewards.filter(rw=> rw.restaurantId!==r.id)}))
  }
  const resetPwd = (r)=>{
    const np = prompt('New password for '+r.adminEmail, 'admin123')
    if(!np) return
    setData(d=> ({...d, restaurants: d.restaurants.map(x=> x.id===r.id? {...x, password:np}:x)}))
    alert('Password updated')
  }
  const loginAs = (r)=>{
    impersonate(r.id)
    navigate('/app/dashboard')
  }

  const openDetail = (r)=> setDetail(r)
  const openEdit = (r)=> setEditForm({ ...r })

  const saveEdit = ()=>{
    setData(d=> ({...d, restaurants: d.restaurants.map(x=> x.id===editForm.id? {...x, name:editForm.name, address:editForm.address, phone:editForm.phone, email:editForm.email, adminName:editForm.adminName, adminEmail:editForm.adminEmail, plan:editForm.plan, status:editForm.status, logo:editForm.logo }:x)}))
    setEditForm(null)
  }

  return (
    <div>
      <div className="flex-between"><h2 className="page-title">Restaurants</h2><button className="btn btn-primary" onClick={()=>setForm({...form, open:true})}>+ Create Restaurant</button></div>
      <div className="toolbar"><input className="input" placeholder="Search name or email" value={q} onChange={e=>setQ(e.target.value)} style={{maxWidth:320}}/></div>
      <Card className="table-card">
        <div className="table-wrap">
        <table className="table table-restaurants">
          <thead><tr><th style={{minWidth:200}}>Restaurant</th><th style={{minWidth:140}}>Owner</th><th>Plan</th><th>Status</th><th style={{textAlign:'center'}}>Customers</th><th style={{textAlign:'center'}}>Visits</th><th style={{whiteSpace:'nowrap'}}>Created</th><th style={{minWidth:260}}>Actions</th></tr></thead>
          <tbody>
            {filtered.map(r=>{
              const custCount = data.customers.filter(c=> c.restaurantId===r.id).length
              const visitCount = data.visits.filter(v=> v.restaurantId===r.id).length
              return <tr key={r.id} className="table-row-hover">
                <td>
                  <div className="cell-restaurant">
                    <RestaurantLogo logo={r.logo} size={36} />
                    <div className="cell-restaurant-meta">
                      <div className="cell-title">{r.name}</div>
                      <div className="cell-sub muted">{r.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="cell-owner">
                    <div className="cell-title">{r.adminName}</div>
                    <div className="cell-sub muted" style={{whiteSpace:'nowrap'}}>{r.phone}</div>
                  </div>
                </td>
                <td><Badge tone={r.plan==='Paid'?'green':'gray'}>{r.plan}</Badge></td>
                <td><Badge tone={r.status==='Active'?'green':'red'}>{r.status}</Badge></td>
                <td style={{textAlign:'center', fontWeight:600}}>{custCount}</td>
                <td style={{textAlign:'center', fontWeight:600}}>{visitCount}</td>
                <td style={{whiteSpace:'nowrap', fontSize:13}}>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="actions-grid">
                    <div className="actions-primary">
                      <button className="btn btn-xs" onClick={()=>openDetail(r)}>View</button>
                      <button className="btn btn-xs" onClick={()=>openEdit(r)}>Edit</button>
                      <button className="btn btn-xs" onClick={()=>toggleStatus(r)}>{r.status==='Active'? 'Suspend':'Activate'}</button>
                    </div>
                    <div className="actions-secondary">
                      <button className="btn btn-xs btn-dark" onClick={()=>loginAs(r)}>Login as</button>
                      <button className="btn btn-xs btn-ghost" onClick={()=>resetPwd(r)}>Reset Pwd</button>
                      <button className="btn btn-xs btn-danger" onClick={()=>del(r)}>Delete</button>
                    </div>
                  </div>
                </td>
              </tr>
            })}
          </tbody>
        </table>
        </div>
      </Card>

      {form.open && (
        <div className="modal-overlay" onClick={()=>setForm({...form, open:false})}>
          <div className="modal modal-large" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>Create Restaurant</h3>
              <button className="btn btn-ghost" onClick={()=>setForm({...form, open:false})}><FiX size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="logo-upload-row">
                <RestaurantLogo logo={form.logo} size={64} />
                <div className="logo-upload-col">
                  <label className="upload-label">Restaurant Logo Upload</label>
                  <label className="file-input-wrap">
                    <input type="file" accept="image/*" className="file-hidden" onChange={e=>{
                      const f=e.target.files?.[0]
                      handleLogoFile(f, (d)=> setForm({...form, logo:d}), (m)=> alert(m))
                    }} />
                    <span className="file-btn">Choose File</span>
                    <span className="file-name muted" style={{display:'inline-flex',alignItems:'center',gap:4}}>{form.logo?.startsWith('data:') ? <><FiCheck size={14} /> Image selected</> : 'No file chosen'}</span>
                  </label>
                  <small className="muted">PNG/JPG under 2MB</small>
                  <input className="input" value={form.logo?.startsWith('data:')?'[uploaded image]':form.logo} onChange={e=>setForm({...form, logo:e.target.value})} placeholder="Upload image above" style={{marginTop:8, display:'none'}} />
                </div>
              </div>
              <div className="form grid-2" style={{marginTop:16}}>
                <label>Restaurant Name*<input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="e.g. Burger Hub"/></label>
                <label>Phone<input className="input" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="01711-000000"/></label>
                <label>Address<input className="input" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} placeholder="Gulshan-1, Dhaka"/></label>
                <label>Email*<input className="input" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="restaurant@email.com"/></label>
                <label>Admin Name<input className="input" value={form.adminName} onChange={e=>setForm({...form, adminName:e.target.value})} placeholder="Owner name"/></label>
                <label>Admin Email*<input className="input" value={form.adminEmail} onChange={e=>setForm({...form, adminEmail:e.target.value})} placeholder="admin@email.com"/></label>
                <label>Password*<input className="input" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="••••••••"/></label>
                <label>Plan<select className="input" value={form.plan} onChange={e=>setForm({...form, plan:e.target.value})}>{(data.plans||[]).filter(p=>p.active).map(p=> <option key={p.id} value={p.name}>{p.name} — {p.maxCustomers}c / {p.maxRewards}r • {data.platformSettings.currency}{p.price}/{p.billing}</option>)}<option value="Free">Free (legacy)</option><option value="Paid">Paid (legacy)</option></select></label>
                <label>Status<select className="input" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}><option>Active</option><option>Suspended</option></select></label>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={()=>setForm({...form, open:false})}>Cancel</button>
              <button className="btn btn-primary" onClick={create}>Create Restaurant</button>
            </div>
          </div>
        </div>
      )}

      {editForm && (
        <div className="modal-overlay" onClick={()=>setEditForm(null)}>
          <div className="modal modal-large" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>Edit Restaurant</h3>
              <button className="btn btn-ghost" onClick={()=>setEditForm(null)}><FiX size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="logo-upload-row">
                <RestaurantLogo logo={editForm.logo} size={64} />
                <div className="logo-upload-col">
                  <label className="upload-label">Restaurant Logo Upload</label>
                  <label className="file-input-wrap">
                    <input type="file" accept="image/*" className="file-hidden" onChange={e=>{
                      const f=e.target.files?.[0]
                      handleLogoFile(f, (d)=> setEditForm({...editForm, logo:d}), (m)=> alert(m))
                    }} />
                    <span className="file-btn">Choose File</span>
                    <span className="file-name muted" style={{display:'inline-flex',alignItems:'center',gap:4}}>{editForm.logo?.startsWith('data:') ? <><FiCheck size={14} /> Image selected</> : 'No file chosen'}</span>
                  </label>
                  <small className="muted">PNG/JPG under 2MB</small>
                  <input className="input" value={editForm.logo?.startsWith('data:')?'[uploaded image]':editForm.logo} onChange={e=>setEditForm({...editForm, logo:e.target.value})} placeholder="Upload image above" style={{marginTop:8, display:'none'}} />
                </div>
              </div>
              <div className="form grid-2" style={{marginTop:16}}>
                <label>Name<input className="input" value={editForm.name} onChange={e=>setEditForm({...editForm, name:e.target.value})}/></label>
                <label>Phone<input className="input" value={editForm.phone} onChange={e=>setEditForm({...editForm, phone:e.target.value})}/></label>
                <label>Address<input className="input" value={editForm.address} onChange={e=>setEditForm({...editForm, address:e.target.value})}/></label>
                <label>Email<input className="input" value={editForm.email} onChange={e=>setEditForm({...editForm, email:e.target.value})}/></label>
                <label>Admin Name<input className="input" value={editForm.adminName} onChange={e=>setEditForm({...editForm, adminName:e.target.value})}/></label>
                <label>Admin Email<input className="input" value={editForm.adminEmail} onChange={e=>setEditForm({...editForm, adminEmail:e.target.value})}/></label>
                <label>Plan<select className="input" value={editForm.plan} onChange={e=>setEditForm({...editForm, plan:e.target.value})}>{(data.plans||[]).filter(p=>p.active).map(p=> <option key={p.id} value={p.name}>{p.name} — {p.maxCustomers}c / {p.maxRewards}r • {data.platformSettings.currency}{p.price}/{p.billing}</option>)}<option value="Free">Free (legacy)</option><option value="Paid">Paid (legacy)</option></select></label>
                <label>Status<select className="input" value={editForm.status} onChange={e=>setEditForm({...editForm, status:e.target.value})}><option>Active</option><option>Suspended</option></select></label>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={()=>setEditForm(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="modal-overlay" onClick={()=>setDetail(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h3 style={{display:'flex', gap:8, alignItems:'center'}}><RestaurantLogo logo={detail.logo} size={32} /> {detail.name}</h3><button className="btn btn-ghost" onClick={()=>setDetail(null)}><FiX size={16} /></button></div>
            <div className="modal-body">
              <div className="grid-2">
                <div><b>Address:</b> {detail.address}</div><div><b>Phone:</b> {detail.phone}</div>
                <div><b>Email:</b> {detail.email}</div><div><b>Admin:</b> {detail.adminName} ({detail.adminEmail})</div>
                <div><b>Loyalty:</b> Welcome {detail.loyalty.welcomeBonus}, Visit {detail.loyalty.pointsPerVisit}, MinBill {detail.loyalty.minBill}, MaxScans/day {detail.loyalty.maxScansPerDay ?? 1}</div>
                <div><b>Social:</b> {JSON.stringify(detail.social)}</div>
              </div>
              <h4 style={{marginTop:12}}>Customers ({data.customers.filter(c=> c.restaurantId===detail.id).length})</h4>
              <table className="table small"><thead><tr><th>Name</th><th>Phone</th><th>Points</th></tr></thead><tbody>
                {data.customers.filter(c=> c.restaurantId===detail.id).slice(0,5).map(c=> <tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td>{c.currentPoints}</td></tr>)}
              </tbody></table>
              <h4>QR</h4>
              <p className="muted">{window.location.origin}/r/{detail.id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
