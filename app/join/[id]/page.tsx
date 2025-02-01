'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateRandomName } from '@/utils/generateName'
import supabase from '@/lib/supabase'

export default function JoinPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  useEffect(() => {
    const joinClassroom = async () => {
      const name = generateRandomName()
      const { data } = await supabase
        .from('participants')
        .insert([
          {
            classroom_id: params.id,
            name,
            role: 'student',
          },
        ])
        .select()
        .single()

      if (data) {
        router.push(`/classroom/${params.id}?role=student&studentId=${data.id}`)
      }
    }

    joinClassroom()
  }, [params.id, router])

  return <div className="text-center p-8">Joining classroom... ⏳</div>
}
