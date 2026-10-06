import React, { useState, useEffect } from 'react'
import { useData } from '../../contexts/DataContext'
import { Card } from '../../components/Layout'
import { handleLogoFile } from '../../utils/logo'
import { FiZap, FiCheck } from '../../components/icons'

export default function PlatformSettings(){
  const { data, setData } = useData()
  const [form,setForm]=useState(data.platformSettings)

  useEffect(()=> setForm(data.platformSettings), [data.platformSettings])

  const save = ()=>{
    const maxScans = parseInt(form.defaultMaxScansPerDay)
    if(isNaN(maxScans) || maxScans<1 || maxScans>10) return alert('Default max scans per day must be between 1 and 10')
    setData(d=> ({...d, platformSettings: {...form, defaultWelcomePoints: parseInt(form.defaultWelcomePoints)||0, defaultVisitPoints: parseInt(form.defaultVisitPoints)||0, defaultMinBill: parseInt(form.defaultMinBill)||0, defaultMaxScansPerDay: maxScans }}))
    alert('Saved! Platform branding updated across the app.')
  }

  const isImage = form.platformLogo?.startsWith('data:image')

  return (
    <div>
      <h2 className="page-title">Platform Settings</h2>
      <Card>
        <div className="form" style={{maxWidth:560}}>
          <h4 style={{margin:0}}>Branding — Platform Name, Tagline & Logo</h4>
          <p className="muted" style={{fontSize:12, margin:'4px 0 8px'}}>Changing these updates branding across all panels, login, and sidebar.</p>

          <label>Platform Name*<input className="input" value={form.platformName} onChange={e=>setForm({...form, platformName:e.target.value})} placeholder="e.g. CRS Loyalty"/></label>
          <label>Tagline<input className="input" value={form.platformTagline || ''} onChange={e=>setForm({...form, platformTagline:e.target.value})} placeholder="e.g. Retention SaaS"/></label>

          <label>Platform Logo
            <div style={{display:'flex', gap:12, alignItems:'center', marginTop:6}}>
              <div style={{width:64, height:64, borderRadius:12, border:'1px solid #e5e7eb', display:'grid', placeItems:'center', overflow:'hidden', background:'#fff', flexShrink:0}}>
                {isImage ? <img src={form.platformLogo} alt="logo" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <div style={{width:32, height:32, background:'#80F800', borderRadius:8, display:'grid', placeItems:'center'}}><FiZap size={18} /></div>}
              </div>
              <div style={{flex:1}}>
                <label className="file-input-wrap">
                  <input type="file" accept="image/*" className="file-hidden" onChange={e=>{
                    const f=e.target.files?.[0]
                    handleLogoFile(f, (d)=> setForm({...form, platformLogo:d}), (m)=> alert(m))
                  }} />
                  <span className="file-btn">Choose File</span>
                  <span className="file-name muted" style={{display:'inline-flex',alignItems:'center',gap:4}}>{isImage ? <><FiCheck size={14} /> Image selected</> : 'No file chosen'}</span>
                </label>
                <small className="muted">PNG/JPG under 2MB. Shows in sidebar & login.</small>
                {isImage && <button type="button" className="btn btn-sm btn-ghost" style={{marginTop:6}} onClick={()=>setForm({...form, platformLogo:''})}>Remove image</button>}
              </div>
            </div>
          </label>

          <hr style={{border:'none', borderTop:'1px solid #eee', margin:'16px 0'}}/>

          <label>Support Email<input className="input" value={form.supportEmail} onChange={e=>setForm({...form, supportEmail:e.target.value})}/></label>
          <label>Support Phone<input className="input" value={form.supportPhone} onChange={e=>setForm({...form, supportPhone:e.target.value})}/></label>
          <label>Currency<input className="input" value={form.currency} onChange={e=>setForm({...form, currency:e.target.value})}/></label>
          <h4>Default loyalty for new restaurants</h4>
          <label>Welcome Points<input className="input" type="number" value={form.defaultWelcomePoints} onChange={e=>setForm({...form, defaultWelcomePoints:e.target.value})}/></label>
          <label>Visit Points<input className="input" type="number" value={form.defaultVisitPoints} onChange={e=>setForm({...form, defaultVisitPoints:e.target.value})}/></label>
          <label>Default Min Bill<input className="input" type="number" value={form.defaultMinBill} onChange={e=>setForm({...form, defaultMinBill:e.target.value})}/></label>
          <label>Default Max Scans Per Day (1–10)<input className="input" type="number" min="1" max="10" value={form.defaultMaxScansPerDay ?? 1} onChange={e=>setForm({...form, defaultMaxScansPerDay:e.target.value})}/></label>
          <button className="btn btn-primary" onClick={save}>Save Settings</button>
        </div>
      </Card>
      <Card style={{marginTop:12}}>
        <h4>Preview</h4>
        <div style={{display:'flex', gap:12, alignItems:'center', padding:12, background:'#000', borderRadius:12, color:'#fff'}}>
          <div style={{width:32,height:32, background:'#80F800', borderRadius:8, display:'grid', placeItems:'center', overflow:'hidden', flexShrink:0}}>
            {isImage ? <img src={form.platformLogo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <FiZap size={18} />}
          </div>
          <div>
            <div style={{fontWeight:800}}>{form.platformName || 'Platform Name'}</div>
            <div style={{fontSize:12, color:'#9ca3af'}}>{form.platformTagline || 'Tagline'}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
