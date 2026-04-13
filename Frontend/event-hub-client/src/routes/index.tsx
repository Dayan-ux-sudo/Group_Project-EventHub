import  { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

function RedirectToLogin() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: '/login', replace: true })
  }, [navigate])

  return null
}

export const Route = createFileRoute('/')({
  component: RedirectToLogin,
})