'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'

export default function JoinClassroom() {
  const [joinId, setJoinId] = useState('')
  const router = useRouter()

  const createClassroom = async () => {
    const { data } = await supabase
      .from('classrooms')
      .insert([{ test_started: false }])
      .select()
      .single()

    if (data) {
      router.push(`/classroom/${data.id}?role=teacher`)
    }
  }

  const joinClassroom = () => {
    if (!joinId.trim()) return
    router.push(`/join/${joinId}`)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
      <button
        onClick={createClassroom}
        className="w-full bg-green-500 text-white py-2 rounded mb-4">
        Create Classroom
      </button>
      <div>
        <input
          type="text"
          placeholder="Enter Classroom ID"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
        />
        <button
          onClick={joinClassroom}
          className="w-full bg-blue-500 text-white py-2 rounded">
          Join Classroom
        </button>
      </div>
    </div>
  )
}
