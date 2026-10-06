import React from 'react'
import {
  FiGrid, FiUsers, FiMapPin, FiGift, FiStar, FiLink,
  FiUser, FiSettings, FiHome, FiTrendingUp, FiCreditCard,
  FiFileText, FiSliders, FiCheck, FiX, FiArrowRight, FiArrowLeft,
  FiCheckCircle, FiLock, FiMenu, FiZap, FiRepeat, FiAward
} from 'react-icons/fi'
import { MdRestaurant, MdQrCode2, MdCelebration, MdStore } from 'react-icons/md'

export const Icon = ({ children, size = 18, ...props }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }} {...props}>{children}</span>
)

export {
  FiGrid, FiUsers, FiMapPin, FiGift, FiStar, FiLink,
  FiUser, FiSettings, FiHome, FiTrendingUp, FiCreditCard,
  FiFileText, FiSliders, FiCheck, FiX, FiArrowRight, FiArrowLeft,
  FiCheckCircle, FiLock, FiMenu, FiZap, FiRepeat, FiAward,
  MdRestaurant, MdQrCode2, MdCelebration, MdStore
}
