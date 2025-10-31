import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Homepage from '../../components/Rohan/HomePage/HomePage'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const guest = localStorage.getItem('guest')
    if (!token && !guest) {
      // If not logged in and not continuing as guest, redirect to login
      // router.replace('/login')
    }
  }, [router])

  return <Homepage />
}