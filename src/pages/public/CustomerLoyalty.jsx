import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { RestaurantLogo } from '../../utils/logo'
import { SiFacebook, SiInstagram, SiTiktok, SiGooglemaps } from 'react-icons/si'
import { FiCheck, FiCheckCircle, FiLock, FiArrowRight, FiArrowLeft } from '../../components/icons'
import { MdCelebration } from '../../components/icons'
import confetti from 'canvas-confetti'

export default function CustomerLoyalty(){
  const { restaurantId } = useParams()
  const { data, processVisit } = useData()
  const restaurant = data.restaurants.find(r=> r.id===restaurantId)
  const [name,setName]=useState('')
  const [phone,setPhone]=useState('')
  const [error,setError]=useState('')
  const [step,setStep]=useState('form') // form | social | result
  const [mode,setMode]=useState('create') // create | signin
  const [pending,setPending]=useState(null)
  const [result,setResult]=useState(null)
  const [tapped,setTapped]=useState({ facebook:false, instagram:false, tiktok:false, googleMaps:false })
  const [socialError,setSocialError]=useState('')

  useEffect(()=>{
    if(step==='result' && result){
      const colors = ['#80F800','#000000','#FFD700','#FF6B6B','#4ECDC4','#ffffff']
      confetti({ particleCount: 130, spread: 90, origin: { y: 0.25 }, colors, zIndex: 9999 })
      const t1 = setTimeout(()=> {
        confetti({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.5 }, colors, zIndex: 9999 })
        confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.5 }, colors, zIndex: 9999 })
      }, 250)
      const t2 = setTimeout(()=> {
        confetti({ particleCount: 90, spread: 120, startVelocity: 35, origin: { y: 0.4 }, colors, zIndex: 9999 })
      }, 600)
      return ()=> { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [step, result])

  if(!restaurant) return <div className="public-wrap"><div className="card" style={{padding:24}}>Restaurant not found. Try <Link to="/r/r1">Burger Hub</Link></div></div>

  const rewards = data.rewards.filter(r=> r.restaurantId===restaurantId && r.active).sort((a,b)=> a.requiredPoints-b.requiredPoints)

  const handleSubmit = (e)=>{
    e.preventDefault()
    setError('')
    const p = phone.trim()
    const n = name.trim()
    if(!p){ setError('Phone number is required'); return }

    const existingSameRestaurant = data.customers.find(c=> c.restaurantId===restaurantId && c.phone===p)
    const globalDuplicate = data.customers.find(c=> c.phone===p)

    if(mode==='signin'){
      // Sign in: just phone number
      if(!existingSameRestaurant){
        setError('Account not found. Please check phone or switch to “Create account”.')
        return
      }
      // use stored name for visit, no name input needed
      const res = processVisit({ restaurantId, name: existingSameRestaurant.name, phone: p })
      if(res.error){ setError(res.error); return }
      setResult(res)
      setStep('result')
      return
    } else {
      if(!n){ setError('Name is required'); return }
      // Create account: must be new, global duplicate blocked
      if(existingSameRestaurant){
        setError('An account with this phone already exists for this restaurant. Please switch to “Sign in”.')
        return
      }
      if(globalDuplicate){
        setError('This phone number is already registered. Each phone number can only be used once.')
        return
      }
      // new customer -> go to social screen before creating account
      setPending({ name:n, phone:p })
      setTapped({ facebook:false, instagram:false, tiktok:false, googleMaps:false })
      setSocialError('')
      setStep('social')
    }
  }

  const handleContinueSocial = ()=>{
    if(!pending) return
    // must tap all configured social buttons before earning points
    const required = []
    if(restaurant.social.facebook) required.push('facebook')
    if(restaurant.social.instagram) required.push('instagram')
    if(restaurant.social.tiktok) required.push('tiktok')
    if(restaurant.social.googleMaps) required.push('googleMaps')
    const allTapped = required.every(k=> tapped[k])
    if(required.length>0 && !allTapped){
      setSocialError(`Please tap all ${required.length} buttons above before continuing. ${tappedCount(required, tapped)}/${required.length} completed.`)
      return
    }
    const res = processVisit({ restaurantId, name: pending.name, phone: pending.phone })
    if(res.error){ setError(res.error); setStep('form'); return }
    setResult(res)
    setStep('result')
  }

  const tappedCount = (required, tappedState) => required.filter(k=> tappedState[k]).length

  const handleSocialTap = (key)=>{
    setTapped(prev=> ({...prev, [key]: true}))
    setSocialError('')
  }

  const reset = ()=> { setResult(null); setPending(null); setName(''); setPhone(''); setError(''); setSocialError(''); setTapped({facebook:false, instagram:false, tiktok:false, googleMaps:false}); setStep('form') }
  const switchMode = (m)=> { setMode(m); setError(''); setSocialError('') }

  // RESULT SCREEN
  if(step==='result' && result){
    const cust = result.customer
    const pts = result.pointsEarned
    const nextReward = rewards.find(r=> r.requiredPoints > cust.currentPoints) || null
    const progress = nextReward ? Math.min(100, Math.round((cust.currentPoints/nextReward.requiredPoints)*100)) : 100
    const todayStr = new Date().toISOString().slice(0,10)
    const todayScans = data.visits.filter(v=> v.restaurantId===restaurantId && v.customerId===cust.id && v.date===todayStr).length
    const limit = restaurant.loyalty?.maxScansPerDay ?? 1
    return (
      <div className="public-wrap">
        <div className="public-card success celebrate-card">
          <div className="hurray-banner">
            <span className="hurray-emoji"><MdCelebration size={26} /></span>
            <div className="hurray-text">
              <div className="hurray-title">Hurray! +{pts} Points Added!</div>
              <div className="hurray-sub">{result.isNew? 'welcome bonus unlocked' : 'visit points earned'}</div>
            </div>
            <span className="hurray-emoji"><MdCelebration size={26} /></span>
          </div>
          <div className="public-header">
            <div style={{display:'flex', justifyContent:'center', marginBottom:8}}><RestaurantLogo logo={restaurant.logo} size={72} /></div>
            <h2>{restaurant.name}</h2>
            <p className="muted" style={{display:'inline-flex',alignItems:'center',gap:6}}>{result.isNew? <><FiCheckCircle size={16} /> Welcome! Account created</> : <><FiCheckCircle size={16} /> Welcome back! Visit recorded</>}</p>
            <p className="muted" style={{fontSize:12}}>Today: {todayScans}/{limit} scans used</p>
          </div>
          <div className="points-hero celebrate-pop">
            <div className="points-circle celebrate-circle"><span>{cust.currentPoints}</span><small>points</small></div>
            <div className="points-meta">
              <div className="points-added" style={{display:'inline-flex',alignItems:'center',gap:6}}>+{pts} {result.isNew? 'welcome bonus' : 'visit points'} added <MdCelebration size={16} /></div>
              <div className="muted">{cust.totalVisits} total visits • {cust.phone}</div>
            </div>
          </div>
          {nextReward ? (
            <div className="progress-box">
              <div className="flex-between"><span>Next: {nextReward.name}</span><span>{cust.currentPoints}/{nextReward.requiredPoints}</span></div>
              <div className="progress"><div className="progress-bar" style={{width: progress+'%'}}></div></div>
              <small className="muted">{nextReward.requiredPoints - cust.currentPoints} points to unlock</small>
            </div>
          ) : (
            <div className="alert success" style={{marginTop:12, display:'flex',alignItems:'center',gap:6}}><MdCelebration size={16} /> You can redeem any reward now!</div>
          )}
          <div className="rewards-grid" style={{marginTop:16}}>
            {rewards.map(r=>{
              const canRedeem = cust.currentPoints >= r.requiredPoints
              return (
                <div key={r.id} className={`reward-card ${canRedeem?'can':''}`}>
                  <div className="r-name">{r.name}</div>
                  <div className="r-desc muted">{r.description}</div>
                  <div className="r-points">{r.requiredPoints} pts {r.type==='Fixed discount'? `• ৳${r.discountAmount} off` : ''}</div>
                  <div className={`r-status ${canRedeem?'ok':'lock'}`} style={{display:'inline-flex',alignItems:'center',gap:4}}>{canRedeem? <><FiCheck size={13} /> Available - show at counter</> : <><FiLock size={13} /> Keep visiting</>}</div>
                </div>
              )
            })}
          </div>
          <button className="btn btn-dark w-full" style={{marginTop:16}} onClick={reset}>Scan again / Another customer</button>
          <Link to="/login" className="link" style={{display:'block', textAlign:'center', marginTop:12}}>Restaurant login</Link>
        </div>
      </div>
    )
  }

  // SOCIAL SCREEN (only for new customers after validation) - must tap all before earning points
  if(step==='social' && pending){
    const required = []
    if(restaurant.social.facebook) required.push('facebook')
    if(restaurant.social.instagram) required.push('instagram')
    if(restaurant.social.tiktok) required.push('tiktok')
    if(restaurant.social.googleMaps) required.push('googleMaps')
    const hasSocial = required.length>0
    const doneCount = required.filter(k=> tapped[k]).length
    const allDone = hasSocial ? doneCount===required.length : true
    return (
      <div className="public-wrap">
        <div className="public-card">
          <div className="public-header">
            <div style={{display:'flex', justifyContent:'center', marginBottom:8}}><RestaurantLogo logo={restaurant.logo} size={64} /></div>
            <h2>Hi {pending.name}!</h2>
            <p className="muted">Support {restaurant.name} to unlock your <b>{restaurant.loyalty.welcomeBonus} points</b> welcome bonus.</p>
          </div>

          <div className="social-stack">
            <div className="flex-between" style={{margin:'8px 0 12px'}}>
              <h3 style={{margin:0, fontSize:15}}>Follow & support us</h3>
              {hasSocial && <span className={`badge ${allDone?'badge-green':'badge-gray'}`}>{doneCount}/{required.length} tapped</span>}
            </div>
            {!hasSocial && <p className="muted" style={{fontSize:13}}>No social links configured — you can continue directly.</p>}
            <div className="social-vertical">
              {restaurant.social.facebook && (
                <a href={restaurant.social.facebook} target="_blank" rel="noreferrer" onClick={()=>handleSocialTap('facebook')} className={`social-btn fb block ${tapped.facebook?'tapped':''}`}>
                  <span className="social-logo fb-logo" aria-hidden>
                    <SiFacebook size={20} color="#1877F2" />
                  </span>
                  <span className="social-text"><span className="social-title">Facebook</span><span className="social-sub">Follow us</span></span>
                  {tapped.facebook ? <span className="tap-check"><FiCheck size={12} /> Tapped</span> : <span className="tap-arrow"><FiArrowRight size={16} /></span>}
                </a>
              )}
              {restaurant.social.instagram && (
                <a href={restaurant.social.instagram} target="_blank" rel="noreferrer" onClick={()=>handleSocialTap('instagram')} className={`social-btn ig block ${tapped.instagram?'tapped':''}`}>
                  <span className="social-logo ig-logo" aria-hidden>
                    <SiInstagram size={20} color="white" />
                  </span>
                  <span className="social-text"><span className="social-title">Instagram</span><span className="social-sub">Follow us</span></span>
                  {tapped.instagram ? <span className="tap-check"><FiCheck size={12} /> Tapped</span> : <span className="tap-arrow"><FiArrowRight size={16} /></span>}
                </a>
              )}
              {restaurant.social.tiktok && (
                <a href={restaurant.social.tiktok} target="_blank" rel="noreferrer" onClick={()=>handleSocialTap('tiktok')} className={`social-btn tk block ${tapped.tiktok?'tapped':''}`}>
                  <span className="social-logo tk-logo" aria-hidden>
                    <SiTiktok size={18} color="#000" />
                  </span>
                  <span className="social-text"><span className="social-title">TikTok</span><span className="social-sub">Follow us</span></span>
                  {tapped.tiktok ? <span className="tap-check"><FiCheck size={12} /> Tapped</span> : <span className="tap-arrow"><FiArrowRight size={16} /></span>}
                </a>
              )}
              {restaurant.social.googleMaps && (
                <a href={restaurant.social.googleMaps} target="_blank" rel="noreferrer" onClick={()=>handleSocialTap('googleMaps')} className={`social-btn gm block ${tapped.googleMaps?'tapped':''}`}>
                  <span className="social-logo gm-logo" aria-hidden>
                    <SiGooglemaps size={20} color="#4285F4" />
                  </span>
                  <span className="social-text"><span className="social-title">Google Maps</span><span className="social-sub">Leave a review</span></span>
                  {tapped.googleMaps ? <span className="tap-check"><FiCheck size={12} /> Tapped</span> : <span className="tap-arrow"><FiArrowRight size={16} /></span>}
                </a>
              )}
            </div>
            {hasSocial && <div className="progress" style={{marginTop:12}}><div className="progress-bar" style={{width: `${required.length? (doneCount/required.length)*100:100}%`}}></div></div>}
            <p className="muted" style={{fontSize:12, marginTop:8}}>
              {hasSocial ? (allDone ? 'All tapped — you can now earn your welcome points!' : `Tap all ${required.length} buttons above. Each tap is tracked. (${doneCount}/${required.length} done)`) : 'Tap continue to earn points.'}
            </p>
            {socialError && <div className="alert error" style={{marginTop:10}}>{socialError}</div>}
          </div>

          <div style={{marginTop:18, display:'flex', flexDirection:'column', gap:10}}>
            <button className={`btn w-full large ${allDone?'btn-primary':'btn-ghost'}`} onClick={handleContinueSocial} disabled={!allDone && hasSocial} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6, ...(!allDone && hasSocial ? {opacity:.6, cursor:'not-allowed'}: {})}}>
              {allDone ? <>Continue <FiArrowRight size={16} /> Earn {restaurant.loyalty.welcomeBonus} Points</> : <>Tap all buttons to continue ({doneCount}/{required.length})</>}
            </button>
            <button className="btn" style={{background:'#fff', border:'1px solid #e5e7eb', display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6}} onClick={()=> {setStep('form'); setPending(null); setSocialError(''); setTapped({facebook:false, instagram:false, tiktok:false, googleMaps:false})}}><FiArrowLeft size={16} /> Back to form</button>
          </div>

          <div className="public-footer muted" style={{marginTop:16}}>
            <span>{restaurant.address} • {restaurant.phone}</span>
          </div>
        </div>
      </div>
    )
  }

  const maxScansPerDay = restaurant.loyalty?.maxScansPerDay ?? 1

  // FORM / VALIDATION SCREEN (first screen) with toggle
  return (
    <div className="public-wrap">
      <div className="public-card">
        <div className="public-header">
          <div style={{display:'flex', justifyContent:'center', marginBottom:8}}><RestaurantLogo logo={restaurant.logo} size={72} /></div>
          <h1>{restaurant.name}</h1>
          <p className="welcome-msg">{restaurant.welcomeMessage}</p>
          <div className="loyalty-explain">
            <div className="loyalty-explain-title">How it works</div>
            <ol className="how-steps">
              <li><span className="how-num">1</span><span className="how-text">Scan the QR code</span></li>
              <li><span className="how-num">2</span><span className="how-text">Join with your name &amp; phone</span></li>
              <li><span className="how-num">3</span><span className="how-text">Earn <b>{restaurant.loyalty.welcomeBonus}</b> welcome points</span></li>
              <li><span className="how-num">4</span><span className="how-text">Every visit: <b>{restaurant.loyalty.pointsPerVisit}</b> points</span></li>
              <li><span className="how-num">5</span><span className="how-text">Unlock &amp; redeem rewards</span></li>
            </ol>
            <div className="how-limit"><FiLock size={12} /> Max {maxScansPerDay} scan{maxScansPerDay>1?'s':''} per day per customer</div>
          </div>
        </div>

        <div className="toggle-group">
          <button type="button" className={`toggle-btn ${mode==='create'?'active':''}`} onClick={()=>switchMode('create')}>Create account</button>
          <button type="button" className={`toggle-btn ${mode==='signin'?'active':''}`} onClick={()=>switchMode('signin')}>Sign in</button>
        </div>
        <p className="muted" style={{fontSize:12, textAlign:'center', margin:'0 0 12px', display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
          {mode==='create' ? <>New here? Create account <FiArrowRight size={12} /> follow socials <FiArrowRight size={12} /> earn {restaurant.loyalty.welcomeBonus} bonus</> : 'Already have an account? Sign in to earn visit points'}
        </p>

        <form onSubmit={handleSubmit} className="form public-form">
          {mode==='create' && (
            <label>Name *<input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required /></label>
          )}
          <label>Phone number *<input className="input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01XXXXXXXXX" required /></label>
          {error && <div className="alert error">{error}</div>}
          <button className="btn btn-primary w-full large" type="submit" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6}}>{mode==='create' ? <>Create account <FiArrowRight size={16} /></> : <>Sign in <FiArrowRight size={16} /> Earn Points</>}</button>
          <small className="muted" style={{textAlign:'center', display:'block'}}>{mode==='create' ? `You’ll go to follow screens, then get ${restaurant.loyalty.welcomeBonus} welcome points.` : `Just your phone number — we’ll find your account and add ${restaurant.loyalty.pointsPerVisit} visit points (max ${maxScansPerDay}/day).`}</small>
        </form>

        <div className="rewards-preview" style={{marginTop:16}}>
          <h3>Available rewards</h3>
          <div className="rewards-grid">
            {rewards.length===0? <p className="muted">No active rewards yet.</p> :
              rewards.map(r=>(
                <div key={r.id} className="reward-card mini">
                  <div className="r-name">{r.name}</div>
                  <div className="r-points">{r.requiredPoints} pts</div>
                  <div className="muted" style={{fontSize:12}}>{r.description}</div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="public-footer muted">
          <span>{restaurant.address} • {restaurant.phone}</span>
          <Link to="/login" className="link">Restaurant admin login</Link>
        </div>
      </div>
    </div>
  )
}
