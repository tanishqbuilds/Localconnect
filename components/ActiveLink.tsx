'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { ReactNode } from 'react'

type Props = {
  href: string
  children: ReactNode
  className?: string
  activeClassName?: string
  exact?: boolean
  onClick?: () => void
}

/**
 * A Link that:
 * 1. Highlights when its route is active
 * 2. Shows an immediate pressed state on click (no lag)
 */
export default function ActiveLink({
  href,
  children,
  className = '',
  activeClassName = 'text-primary-600 font-semibold',
  exact = false,
  onClick,
}: Props) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)
  const [pressed, setPressed] = useState(false)

  return (
    <Link
      href={href}
      onClick={() => {
        setPressed(true)
        onClick?.()
        // Reset after nav completes
        setTimeout(() => setPressed(false), 600)
      }}
      className={`
        ${className}
        ${isActive ? activeClassName : ''}
        ${pressed ? 'opacity-60 scale-95' : ''}
        inline-flex items-center gap-1 transition-all duration-100 select-none
      `}
    >
      {children}
    </Link>
  )
}
