import React, { createContext, useContext, useEffect, useState } from 'react'
import { loadStore, saveStore, genId } from '../data/store'

const DataContext = createContext(null)
export const useData = () => useContext(DataContext)

export function DataProvider({ children }){
  const [data, setData] = useState(()=> loadStore())

  useEffect(()=> { saveStore(data) }, [data])

  const log = (user, restaurantId, action, target) => {
    setData(d=> ({...d, activityLogs: [{id: genId('a'), user, restaurantId, action, target, date: new Date().toISOString()}, ...d.activityLogs]}))
  }

  const addCustomerAndVisit = ({ restaurantId, name, phone, staffId }) => {
    let result = null
    setData(prev=>{
      const d = structuredClone(prev)
      const rest = d.restaurants.find(r=> r.id===restaurantId)
      if(!rest) return prev
      let customer = d.customers.find(c=> c.restaurantId===restaurantId && c.phone===phone)
      const now = new Date()
      const date = now.toISOString().slice(0,10)
      const time = now.toTimeString().slice(0,5)
      if(!customer){
        // new customer
        const welcome = rest.loyalty.welcomeBonus || 0
        customer = { id: genId('c'), restaurantId, name: name || 'Guest', phone, totalVisits: 1, currentPoints: welcome, createdAt: now.toISOString(), lastVisitAt: now.toISOString() }
        d.customers.push(customer)
        d.visits.push({ id: genId('v'), restaurantId, customerId: customer.id, date, time, pointsEarned: welcome, staffId: staffId||null })
        d.pointTransactions.push({ id: genId('pt'), restaurantId, customerId: customer.id, type:'Welcome bonus', points: welcome, reason:'Welcome bonus', date: now.toISOString() })
        d.activityLogs.unshift({ id: genId('a'), user: name||phone, restaurantId, action:'Customer joined', target: phone, date: now.toISOString() })
        result = { customer, isNew:true, pointsEarned: welcome }
      } else {
        const visitPoints = rest.loyalty.pointsPerVisit || 0
        if(name && name!==customer.name) customer.name = name
        customer.totalVisits += 1
        customer.currentPoints += visitPoints
        customer.lastVisitAt = now.toISOString()
        d.visits.push({ id: genId('v'), restaurantId, customerId: customer.id, date, time, pointsEarned: visitPoints, staffId: staffId||null })
        d.pointTransactions.push({ id: genId('pt'), restaurantId, customerId: customer.id, type:'Visit points', points: visitPoints, reason:'Visit', date: now.toISOString() })
        d.activityLogs.unshift({ id: genId('a'), user: customer.name, restaurantId, action:'Visit recorded', target: customer.phone, date: now.toISOString() })
        result = { customer, isNew:false, pointsEarned: visitPoints }
      }
      return d
    })
    // need to return updated customer - we use setData functional but need sync return; workaround: after timeout read from data
    // Instead we compute result synchronously - hack: we already have result
    return result
  }

  const getPlanLimits = (restaurant) => {
    const plan = data.plans?.find(p=> p.name===restaurant.plan)
    return plan || { maxCustomers: 100, maxRewards: 3 }
  }

  const getTodayScanCount = (restaurantId, customerId) => {
    const today = new Date().toISOString().slice(0,10)
    return data.visits.filter(v=> v.restaurantId===restaurantId && v.customerId===customerId && v.date===today).length
  }

  // Improved synchronous version for immediate UI - enforces no duplicate phone numbers globally + plan limits + daily scan limit
  const processVisit = ({ restaurantId, name, phone }) => {
    // read current data snapshot
    const rest = data.restaurants.find(r=> r.id===restaurantId)
    if(!rest) return { error: 'Restaurant not found' }
    const existing = data.customers.find(c=> c.restaurantId===restaurantId && c.phone===phone)
    const now = new Date()
    const todayStr = now.toISOString().slice(0,10)
    const maxScans = rest.loyalty?.maxScansPerDay ?? 1
    if(!existing){
      if(!name) return { error: 'Name required for first visit' }
      // global duplicate check - requirement: There can't be customers with same numbers
      const globalDup = data.customers.find(c=> c.phone===phone)
      if(globalDup) return { error: 'This phone number is already registered. Each phone number can only be used once.' }
      // plan limit: number of customer accounts
      const limits = getPlanLimits(rest)
      const currentCount = data.customers.filter(c=> c.restaurantId===restaurantId).length
      if(currentCount >= limits.maxCustomers){
        return { error: `Customer limit reached for ${rest.plan} plan (${limits.maxCustomers} accounts). Please upgrade plan.` }
      }
      const welcome = rest.loyalty.welcomeBonus
      const customer = { id: genId('c'), restaurantId, name, phone, totalVisits: 1, currentPoints: welcome, createdAt: now.toISOString(), lastVisitAt: now.toISOString() }
      const visit = { id: genId('v'), restaurantId, customerId: customer.id, date: now.toISOString().slice(0,10), time: now.toTimeString().slice(0,5), pointsEarned: welcome, staffId: null }
      const tx = { id: genId('pt'), restaurantId, customerId: customer.id, type:'Welcome bonus', points: welcome, reason:'Welcome bonus', date: now.toISOString() }
      const logEntry = { id: genId('a'), user: name, restaurantId, action:'Customer joined', target: phone, date: now.toISOString() }
      setData(d=> ({...d, customers:[...d.customers, customer], visits:[visit, ...d.visits], pointTransactions:[tx, ...d.pointTransactions], activityLogs:[logEntry, ...d.activityLogs]}))
      return { customer, isNew:true, pointsEarned: welcome }
    } else {
      // returning customer: if name provided, must match; if not provided (phone-only sign in), allow
      if(name && name.trim() && existing.name.trim().toLowerCase() !== name.trim().toLowerCase()){
        return { error: 'Name and phone number do not match. Please check your name as registered.' }
      }
      // daily scan limit: how many times a day can a user scan the QR
      if(maxScans > 0){
        const todayCount = data.visits.filter(v=> v.restaurantId===restaurantId && v.customerId===existing.id && v.date===todayStr).length
        if(todayCount >= maxScans){
          return { error: `Daily scan limit reached (${maxScans} per day). Please come back tomorrow.` }
        }
      }
      const pts = rest.loyalty.pointsPerVisit
      const updated = { ...existing, totalVisits: existing.totalVisits+1, currentPoints: existing.currentPoints+pts, lastVisitAt: now.toISOString(), name: existing.name }
      const visit = { id: genId('v'), restaurantId, customerId: existing.id, date: now.toISOString().slice(0,10), time: now.toTimeString().slice(0,5), pointsEarned: pts, staffId: null }
      const tx = { id: genId('pt'), restaurantId, customerId: existing.id, type:'Visit points', points: pts, reason:'Visit', date: now.toISOString() }
      const logEntry = { id: genId('a'), user: updated.name, restaurantId, action:'Visit recorded', target: updated.phone, date: now.toISOString() }
      setData(d=> ({...d, customers: d.customers.map(c=> c.id===existing.id? updated : c), visits:[visit,...d.visits], pointTransactions:[tx, ...d.pointTransactions], activityLogs:[logEntry,...d.activityLogs]}))
      return { customer: updated, isNew:false, pointsEarned: pts }
    }
  }

  const value = { data, setData, processVisit, getTodayScanCount, log, genId }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
