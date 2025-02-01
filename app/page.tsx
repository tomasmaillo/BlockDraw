'use client'

import JoinClassroom from '@/components/JoinClassroom'
import Layout from '@/components/Layout'
import Image from 'next/image'

export default function Home() {
  return (
    <Layout>
      <Image src="/logo.svg" alt="BlockDraw" width={100} height={100} />
      <JoinClassroom />
    </Layout>
  )
}
