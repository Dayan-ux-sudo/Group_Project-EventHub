import  { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { getStoredUser } from '../api'

function RedirectToLogin() {
  const navigate = useNavigate()

  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      navigate({ to: user.role === 'student' ? '/explore' : '/Host', replace: true })
      return
    }
    navigate({ to: '/login', replace: true })
  }, [navigate])

  return null
}

export const Route = createFileRoute('/')({
  component: RedirectToLogin,
})
