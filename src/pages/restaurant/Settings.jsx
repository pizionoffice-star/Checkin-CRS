import React, { useState, useEffect } from 'react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { Card } from '../../components/Layout'
import { RestaurantLogo, handleLogoFile } from '../../utils/logo'
import { MdRestaurant } from '../../components/icons'

export default function Settings(){
  const { data, setData } = useData()
  const { session } = useAuth()
  const rid = session.restaurantId
  const restaurant = data.restaurants.find(r=> r.id===rid)
  const [form,setForm]=useState({ name:restaurant.name, logo:restaurant.logo, address:restaurant.address, phone:restaurant.phone, welcomeMessage:restaurant.welcomeMessage, adminName:restaurant.adminName, adminEmail:restaurant.adminEmail, password:restaurant.password })
  useEffect(()=> setForm({ name:restaurant.name, logo:restaurant.logo, address:restaurant.address, phone:restaurant.phone, welcomeMessage:restaurant.welcomeMessage, adminName:restaurant.adminName, adminEmail:restaurant.adminEmail, password:restaurant.password }), [restaurant])
  const isStaff = session.role==='staff'
  const save = ()=>{
    if(isStaff) return alert('Not allowed')
    setData(d=> ({...d, restaurants: d.restaurants.map(r=> r.id===rid? {...r, name:form.name, logo:form.logo, address:form.address, phone:form.phone, welcomeMessage:form.welcomeMessage, adminName:form.adminName, adminEmail:form.adminEmail, password:form.password }:r)}))
    alert('Saved!')
  }
  return (
    <div>
      <h2 className="page-title">Settings</h2>
      <Card>
        <div className="form" style={{maxWidth:560}}>
          <label>Restaurant Name<input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} disabled={isStaff}/></label>
          <label>Restaurant Logo
            <div style={{display:'flex', gap:12, alignItems:'center', marginTop:6}}>
              <RestaurantLogo logo={form.logo} size={64} />
              {!isStaff && (
                <div style={{flex:1}}>
                  <input type="file" accept="image/*" className="input" onChange={e=>{
                    const f=e.target.files?.[0]
                    handleLogoFile(f, (dataUrl)=> setForm({...form, logo:dataUrl}), (msg)=> alert(msg))
                  }} />
                  <small className="muted">Upload PNG/JPG under 2MB.</small>
                </div>
              )}
              {isStaff && <RestaurantLogo logo={form.logo} size={40} />}
            </div>
          </label>
          <label>Address<input className="input" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} disabled={isStaff}/></label>
          <label>Phone<input className="input" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} disabled={isStaff}/></label>
          <label>Customer-facing Welcome Message<textarea className="input" rows={3} value={form.welcomeMessage} onChange={e=>setForm({...form, welcomeMessage:e.target.value})} disabled={isStaff}/></label>
          <h4 style={{marginTop:12}}>Admin Profile</h4>
          <label>Admin Name<input className="input" value={form.adminName} onChange={e=>setForm({...form, adminName:e.target.value})} disabled={isStaff}/></label>
          <label>Admin Email<input className="input" value={form.adminEmail} onChange={e=>setForm({...form, adminEmail:e.target.value})} disabled={isStaff}/></label>
          <label>Password<input className="input" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} disabled={isStaff}/></label>
          {!isStaff && <button className="btn btn-primary" onClick={save}>Save Settings</button>}
          {isStaff && <div className="alert">Staff cannot change restaurant settings</div>}
        </div>
      </Card>
    </div>
  )
}
