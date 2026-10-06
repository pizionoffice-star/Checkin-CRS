const STORAGE_KEY = 'crs_saas_v1'

const seed = () => {
  const now = new Date().toISOString()
  return {
    platformSettings: {
      platformName: 'CRS Loyalty',
      platformTagline: 'Retention SaaS',
      platformLogo: '',
      supportEmail: 'support@crsloyalty.com',
      supportPhone: '+880 9611-000000',
      currency: '৳',
      defaultWelcomePoints: 100,
      defaultVisitPoints: 50,
      defaultMinBill: 0,
      defaultMaxScansPerDay: 1,
    },
    restaurants: [
      {
        id: 'r1',
        name: 'Burger Hub',
        logo: '',
        address: 'Gulshan-1, Dhaka',
        phone: '01711-111111',
        email: 'admin@burgerhub.com',
        adminName: 'Rakib Hasan',
        adminEmail: 'admin@burgerhub.com',
        password: 'admin123',
        plan: 'Paid',
        status: 'Active',
        createdAt: '2026-02-10T10:00:00.000Z',
        loyalty: { welcomeBonus: 100, pointsPerVisit: 50, minBill: 0, maxScansPerDay: 1 },
        social: {
          facebook: 'https://facebook.com/burgerhub',
          instagram: 'https://instagram.com/burgerhub',
          tiktok: 'https://tiktok.com/@burgerhub',
          googleMaps: 'https://maps.google.com/?q=burger+hub+dhaka',
        },
        welcomeMessage: 'Welcome to Burger Hub! Scan, earn & unlock free burgers',
      },
      {
        id: 'r2',
        name: 'Spice Route',
        logo: '',
        address: 'Dhanmondi 27, Dhaka',
        phone: '01722-222222',
        email: 'admin@spiceroute.com',
        adminName: 'Nadia Karim',
        adminEmail: 'admin@spiceroute.com',
        password: 'admin123',
        plan: 'Free',
        status: 'Active',
        createdAt: '2026-03-01T09:00:00.000Z',
        loyalty: { welcomeBonus: 80, pointsPerVisit: 40, minBill: 200, maxScansPerDay: 1 },
        social: {
          facebook: 'https://facebook.com/spiceroute',
          instagram: 'https://instagram.com/spiceroute',
          tiktok: '',
          googleMaps: 'https://maps.google.com/?q=spice+route+dhaka',
        },
        welcomeMessage: 'Spice Route rewards your cravings — collect points on every visit!',
      },
      {
        id: 'r3',
        name: 'Sushi Zen',
        logo: '',
        address: 'Banani, Dhaka',
        phone: '01733-333333',
        email: 'admin@sushizen.com',
        adminName: 'Akira Tanaka',
        adminEmail: 'admin@sushizen.com',
        password: 'admin123',
        plan: 'Paid',
        status: 'Suspended',
        createdAt: '2026-03-15T11:00:00.000Z',
        loyalty: { welcomeBonus: 120, pointsPerVisit: 60, minBill: 0, maxScansPerDay: 1 },
        social: { facebook: '', instagram: '', tiktok: '', googleMaps: '' },
        welcomeMessage: 'Sushi Zen — Fresh points, fresh sushi!',
      },
    ],
    customers: [
      { id: 'c1', restaurantId: 'r1', name: 'Tahmid Rahman', phone: '01710000001', totalVisits: 5, currentPoints: 320, createdAt: '2026-04-01T10:00:00Z', lastVisitAt: '2026-09-10T18:30:00Z' },
      { id: 'c2', restaurantId: 'r1', name: 'Sara Ahmed', phone: '01710000002', totalVisits: 2, currentPoints: 150, createdAt: '2026-08-20T12:00:00Z', lastVisitAt: '2026-09-12T13:00:00Z' },
      { id: 'c3', restaurantId: 'r1', name: 'Jahid Khan', phone: '01710000003', totalVisits: 8, currentPoints: 60, createdAt: '2026-03-10T09:00:00Z', lastVisitAt: '2026-09-15T19:00:00Z' },
      { id: 'c4', restaurantId: 'r2', name: 'Mina Chowdhury', phone: '01720000001', totalVisits: 3, currentPoints: 200, createdAt: '2026-07-01T10:00:00Z', lastVisitAt: '2026-09-11T12:00:00Z' },
    ],
    visits: [
      { id: 'v1', restaurantId: 'r1', customerId: 'c3', date: '2026-09-15', time: '19:00', pointsEarned: 50, staffId: null },
      { id: 'v2', restaurantId: 'r1', customerId: 'c2', date: '2026-09-12', time: '13:00', pointsEarned: 50, staffId: null },
      { id: 'v3', restaurantId: 'r2', customerId: 'c4', date: '2026-09-11', time: '12:00', pointsEarned: 40, staffId: null },
      { id: 'v4', restaurantId: 'r1', customerId: 'c1', date: '2026-09-10', time: '18:30', pointsEarned: 50, staffId: null },
    ],
    pointTransactions: [
      { id: 'pt1', restaurantId: 'r1', customerId: 'c1', type: 'Welcome bonus', points: 100, reason: 'Welcome bonus', date: '2026-04-01T10:00:00Z' },
      { id: 'pt2', restaurantId: 'r1', customerId: 'c1', type: 'Visit points', points: 50, reason: 'Visit #2', date: '2026-04-10T10:00:00Z' },
      { id: 'pt3', restaurantId: 'r1', customerId: 'c3', type: 'Visit points', points: 50, reason: 'Visit', date: '2026-09-15T19:00:00Z' },
      { id: 'pt4', restaurantId: 'r1', customerId: 'c3', type: 'Reward redemption', points: -500, reason: 'Redeemed Free Burger', date: '2026-09-01T10:00:00Z' },
    ],
    rewards: [
      { id: 'rw1', restaurantId: 'r1', name: 'Free Burger', description: 'Classic beef burger with fries', requiredPoints: 500, type: 'Free item', discountAmount: 0, active: true, createdAt: '2026-02-11T10:00:00Z' },
      { id: 'rw2', restaurantId: 'r1', name: '৳200 Discount', description: 'Flat ৳200 off on bill above ৳500', requiredPoints: 800, type: 'Fixed discount', discountAmount: 200, active: true, createdAt: '2026-02-11T10:00:00Z' },
      { id: 'rw3', restaurantId: 'r1', name: 'Free Drinks', description: 'Any soft drink free', requiredPoints: 300, type: 'Free item', discountAmount: 0, active: false, createdAt: '2026-03-01T10:00:00Z' },
      { id: 'rw4', restaurantId: 'r2', name: 'Free Biryani', description: 'Chicken biryani half', requiredPoints: 600, type: 'Free item', discountAmount: 0, active: true, createdAt: '2026-03-02T10:00:00Z' },
    ],
    redemptions: [
      { id: 'rd1', restaurantId: 'r1', customerId: 'c3', rewardId: 'rw1', pointsUsed: 500, date: '2026-09-01T10:00:00Z', status: 'Completed' },
    ],
    staff: [
      { id: 's1', restaurantId: 'r1', name: 'Imran Staff', email: 'staff@burgerhub.com', password: 'staff123', role: 'Staff' },
      { id: 's2', restaurantId: 'r2', name: 'Rina Staff', email: 'staff@spiceroute.com', password: 'staff123', role: 'Staff' },
    ],
    activityLogs: [
      { id: 'a1', user: 'Super Admin', restaurantId: null, action: 'Restaurant created', target: 'Burger Hub', date: '2026-02-10T10:00:00Z' },
      { id: 'a2', user: 'Rakib Hasan', restaurantId: 'r1', action: 'Reward created', target: 'Free Burger', date: '2026-02-11T10:00:00Z' },
      { id: 'a3', user: 'Imran Staff', restaurantId: 'r1', action: 'Points manually added', target: 'Tahmid Rahman +50', date: '2026-09-10T18:30:00Z' },
    ],
    plans: [
      { id: 'plan_free', name: 'Free', price: 0, billing: 'monthly', maxCustomers: 100, maxRewards: 3, description: 'Basic loyalty for trial', features: ['QR loyalty','Points & rewards','Up to 100 customers','3 rewards max'], highlight: false, active: true },
      { id: 'plan_paid', name: 'Paid', price: 499, billing: 'monthly', maxCustomers: 5000, maxRewards: 50, description: 'Unlimited growth for serious restaurants', features: ['Everything in Free','Up to 5000 customers','50 rewards','Staff accounts','Priority support'], highlight: true, active: true },
    ],
    subscriptions: [
      { id: 'sub1', restaurantId: 'r1', plan: 'Paid', status: 'Active', startDate: '2026-02-10', expiryDate: '2027-02-10' },
      { id: 'sub2', restaurantId: 'r2', plan: 'Free', status: 'Active', startDate: '2026-03-01', expiryDate: '2026-09-01' },
      { id: 'sub3', restaurantId: 'r3', plan: 'Paid', status: 'Suspended', startDate: '2026-03-15', expiryDate: '2027-03-15' },
    ],
  }
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // migration: inject plans if missing
      if(!parsed.plans || !Array.isArray(parsed.plans) || parsed.plans.length===0){
        const s = seed()
        parsed.plans = s.plans
        // ensure platformSettings exists
        if(!parsed.platformSettings) parsed.platformSettings = s.platformSettings
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      }
      let migrated=false
      // ensure platformSettings branding fields
      if(!parsed.platformSettings.platformTagline){ parsed.platformSettings.platformTagline='Retention SaaS'; migrated=true }
      if(parsed.platformSettings.platformLogo===undefined){ parsed.platformSettings.platformLogo=''; migrated=true }
      if(parsed.platformSettings.defaultMaxScansPerDay===undefined){ parsed.platformSettings.defaultMaxScansPerDay=1; migrated=true }
      // ensure each restaurant has maxScansPerDay + migrate legacy emoji logos to vector
      if(parsed.restaurants){
        const emojiRe = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF\u2B00-\u2BFF\uFE0F]/u
        parsed.restaurants.forEach(r=>{
          if(!r.loyalty) { r.loyalty={ welcomeBonus:100, pointsPerVisit:50, minBill:0, maxScansPerDay:1 }; migrated=true }
          if(r.loyalty.maxScansPerDay===undefined){ r.loyalty.maxScansPerDay=1; migrated=true }
          if(typeof r.logo==='string' && r.logo!=='' && emojiRe.test(r.logo)){ r.logo=''; migrated=true }
        })
      }
      // ensure each plan has main controls
      parsed.plans.forEach(p=>{
        if(p.maxCustomers===undefined){ p.maxCustomers=100; migrated=true }
        if(p.maxRewards===undefined){ p.maxRewards=3; migrated=true }
        if(p.price===undefined){ p.price=0; migrated=true }
      })
      if(migrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      return parsed
    }
  } catch {}
  const data = seed()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return data
}

export function saveStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetStore() {
  localStorage.removeItem(STORAGE_KEY)
  return loadStore()
}

export function genId(prefix='id'){ return prefix+'_'+Math.random().toString(36).slice(2,9) }

