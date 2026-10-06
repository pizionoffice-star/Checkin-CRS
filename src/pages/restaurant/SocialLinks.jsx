import React, { useState, useEffect } from 'react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { Card } from '../../components/Layout'

export default function SocialLinks(){
  const { data, setData } = useData()
  const { session } = useAuth()
  const rid = session.restaurantId
  const restaurant = data.restaurants.find(r=> r.id===rid)
  const [form,setForm]=useState(restaurant.social)
  useEffect(()=> setForm(restaurant.social), [restaurant])
  const isStaff = session.role==='staff'
  const save = ()=>{
    if(isStaff) return alert('Not allowed')
    setData(d=> ({...d, restaurants: d.restaurants.map(r=> r.id===rid? {...r, social:{...form}}:r)}))
    alert('Saved!')
  }
  return (
    <div>
      <h2 className="page-title">Social Links</h2>
      <Card>
        <p className="muted">These links appear on the customer QR onboarding page.</p>
        <div className="form" style={{maxWidth:520}}>
          <label>Facebook URL<input className="input" value={form.facebook} onChange={e=>setForm({...form, facebook:e.target.value})} placeholder="https://facebook.com/..." disabled={isStaff}/></label>
          <label>Instagram URL<input className="input" value={form.instagram} onChange={e=>setForm({...form, instagram:e.target.value})} placeholder="https://instagram.com/..." disabled={isStaff}/></label>
          <label>TikTok URL<input className="input" value={form.tiktok} onChange={e=>setForm({...form, tiktok:e.target.value})} placeholder="https://tiktok.com/@..." disabled={isStaff}/></label>
          <label>Google Maps Review URL<input className="input" value={form.googleMaps} onChange={e=>setForm({...form, googleMaps:e.target.value})} placeholder="https://maps.google.com/..." disabled={isStaff}/></label>
          {!isStaff && <button className="btn btn-primary" onClick={save}>Save Links</button>}
        </div>
      </Card>
    </div>
  )
}
