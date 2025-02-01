import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'

const Join = () => {
  const router = useRouter()
  const { id, role } = router.query

  useEffect(() => {
    if (id && role) {
      router.push(`/classroom/${id}?role=${role}`)
    }
  }, [id, role, router])

  return (
    <Layout>
      <p>Joining classroom...</p>
    </Layout>
  )
}

export default Join
