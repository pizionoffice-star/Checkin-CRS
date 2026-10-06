import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { Card } from '../../components/Layout'

export default function Staff(){
  const { data, setData, genId } = useData()
  const { session } = useAuth()
  const rid = session.restaurantId
  const isStaff = session.role==='staff'
  const staffList = data.staff.filter(s=> s.restaurantId===rid)
  const [form,setForm]=useState({ open:false, name:'', email:'', password:'' })

  const create = ()=>{
    if(isStaff) return alert('Staff cannot manage staff')
    if(!form.name || !form.email || !form.password) return alert('All fields required')
    const ns = { id: genId('s'), restaurantId: rid, name:form.name, email:form.email, password:form.password, role:'Staff' }
    setData(d=> ({...d, staff:[...d.staff, ns], activityLogs:[{id:genId('a'), user:session.name, restaurantId:rid, action:'Staff created', target:form.name, date:new Date().toISOString()}, ...d.activityLogs]}))
    setForm({ open:false, name:'', email:'', password:'' })
  }
  const remove = (id)=>{
    if(isStaff) return alert('Not allowed')
    if(!confirm('Delete staff?')) return
    setData(d=> ({...d, staff: d.staff.filter(s=> s.id!==id)}))
  }

  return (
    <div>
      <div className="flex-between"><h2 className="page-title">Staff</h2>{!isStaff && <button className="btn btn-primary" onClick={()=>setForm({...form, open:true})}>+ Add Staff</button>}</div>
      {isStaff && <div className="alert">You have staff limited access: search customers, process visits, redeem rewards.</div>}
      <Card>
        <table className="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Login</th>{!isStaff && <th></th>}</tr></thead><tbody>
          {staffList.map(s=> <tr key={s.id}><td>{s.name}</td><td>{s.email}</td><td>{s.role}</td><td><code>{s.email} / {s.password}</code></td>{!isStaff && <td><button className="btn btn-sm btn-dark" onClick={()=>remove(s.id)}>Delete</button></td>}</tr>)}
          {staffList.length===0 && <tr><td colSpan={5} className="muted">No staff</td></tr>}
        </tbody></table>
      </Card>

      {form.open && (
        <div className="modal-overlay" onClick={()=>setForm({...form, open:false})}>
          <div className="modal small" onClick={e=>e.stopPropagation()}>
            <h3>Add Staff</h3>
            <div className="form">
              <label>Name<input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/></label>
              <label>Email<input className="input" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/></label>
              <label>Password<input className="input" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/></label>
              <div className="btn-row"><button className="btn btn-primary" onClick={create}>Create</button><button className="btn btn-ghost" onClick={()=>setForm({...form, open:false})}>Cancel</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
