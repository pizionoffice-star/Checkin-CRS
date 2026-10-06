import React, { useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { Card } from '../../components/Layout'
import { QRCodeSVG } from 'qrcode.react'
import { RestaurantLogo } from '../../utils/logo'
import { FiArrowRight } from '../../components/icons'

export default function QRCodePage(){
  const { session } = useAuth()
  const { data } = useData()
  const rid = session.restaurantId
  const restaurant = data.restaurants.find(r=> r.id===rid)
  const url = `${window.location.origin}/#/r/${rid}` // hash router
  const altUrl = `${window.location.origin}/#/r/${rid}`

  const print = ()=>{
    const w = window.open('', '_blank')
    w.document.write(`<html><body style="text-align:center; font-family:sans-serif"><h1>${restaurant.name}</h1><p>Scan to join loyalty</p><div id="qr"></div><p>${altUrl}</p><script>window.print()</script></body></html>`)
    w.document.close()
  }

  return (
    <div>
      <h2 className="page-title">QR Code</h2>
      <div className="grid-2">
        <Card style={{textAlign:'center'}}>
          <div style={{display:'flex', justifyContent:'center', marginBottom:12}}><RestaurantLogo logo={restaurant.logo} size={56} /></div>
          <div style={{background:'#fff', padding:16, display:'inline-block', borderRadius:16, border:'1px solid #eee'}}>
            <QRCodeSVG value={altUrl} size={220} />
          </div>
          <h3 style={{marginTop:12}}>{restaurant.name}</h3>
          <p className="muted" style={{wordBreak:'break-all'}}>{altUrl}</p>
          <div className="btn-row" style={{justifyContent:'center', marginTop:12}}>
            <button className="btn btn-dark" onClick={print}>Print QR</button>
            <button className="btn btn-primary" onClick={()=> navigator.clipboard.writeText(altUrl).then(()=>alert('Copied!'))}>Copy Link</button>
            <a className="btn btn-ghost" href={`/r/${rid}`} target="_blank" rel="noreferrer">Open Loyalty Page</a>
          </div>
          <div className="alert" style={{marginTop:12, textAlign:'left', background:'#f5f5f5', border:'1px solid #eee', display:'flex',alignItems:'center',gap:4,flexWrap:'wrap'}}>Place this QR at reception / counter / table. Customers scan <FiArrowRight size={12} /> join <FiArrowRight size={12} /> earn points. QR securely identifies restaurant <b>{rid}</b>.</div>
        </Card>
        <Card>
          <h3>How to use</h3>
          <ol style={{lineHeight:'1.8'}}>
            <li>Print QR and place at visible spot</li>
            <li style={{display:'flex',alignItems:'center',gap:4}}>Customer scans <FiArrowRight size={12} /> sees branded loyalty page</li>
            <li style={{display:'flex',alignItems:'center',gap:4}}>First scan: enters name + phone <FiArrowRight size={12} /> gets welcome points</li>
            <li style={{display:'flex',alignItems:'center',gap:4}}>Next visits: enters phone <FiArrowRight size={12} /> gets visit points</li>
            <li>Staff can also search customers and redeem rewards</li>
          </ol>
          <div className="kpi" style={{marginTop:12}}><b>{data.customers.filter(c=> c.restaurantId===rid).length}</b><span>Customers joined via QR</span></div>
        </Card>
      </div>
    </div>
  )
}
