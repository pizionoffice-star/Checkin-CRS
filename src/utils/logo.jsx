import React from 'react'
import { MdRestaurant } from '../components/icons'

export function isImageLogo(logo){
  return typeof logo === 'string' && logo.startsWith('data:image')
}

const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF\u2B00-\u2BFF\uFE0F]/u

export function isEmojiLogo(logo){
  return typeof logo === 'string' && logo !== '' && !logo.startsWith('data:') && EMOJI_PATTERN.test(logo)
}

export function RestaurantLogo({ logo, size=42, className='', style={}, alt='logo' }){
  if(isImageLogo(logo)){
    return <img src={logo} alt={alt} className={className} style={{ width:size, height:size, objectFit:'cover', borderRadius:size>40?16:10, border:'1px solid #e5e7eb', background:'#fff', ...style }} />
  }
  // Standard vector fallback for empty or legacy emoji logos
  return (
    <span className={className} style={{ width:size, height:size, display:'inline-flex', alignItems:'center', justifyContent:'center', background:'#f3f4f6', border:'1px solid #e5e7eb', borderRadius:size>40?16:10, color:'#111', flexShrink:0, ...style }}>
      <MdRestaurant size={Math.round(size*0.55)} />
    </span>
  )
}

export function handleLogoFile(file, onDone, onError){
  if(!file) return
  if(!file.type.startsWith('image/')){ onError?.('Please select an image file'); return }
  if(file.size > 2*1024*1024){ onError?.('Image must be under 2MB'); return }
  const reader = new FileReader()
  reader.onload = ()=> onDone(reader.result)
  reader.onerror = ()=> onError?.('Failed to read file')
  reader.readAsDataURL(file)
}
