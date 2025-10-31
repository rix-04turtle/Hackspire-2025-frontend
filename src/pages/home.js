import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Homepage from './Homepage'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      // router.replace('/login')
    }
  }, [router])

  return <Homepage />
}