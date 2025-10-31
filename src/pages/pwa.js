import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/language')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-green-50 to-green-100">
      <div className="text-green-800">Loading...</div>
    </div>
  )
}