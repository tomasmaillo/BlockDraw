'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'
import Image from 'next/image'
export default function JoinClassroom() {
  const [joinCode, setJoinCode] = useState('')
  const router = useRouter()

  const generateSimpleId = () => {
    // Generate a 6-character alphanumeric ID (uppercase letters and numbers)
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed similar-looking characters (0,1,I,O)
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  const createClassroom = async () => {
    try {
      const simpleCode = generateSimpleId()
      const { data, error } = await supabase
        .from('classrooms')
        .insert([
          {
            join_code: simpleCode,
            test_started: false,
            current_exercise_id: null,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Failed to create classroom:', error)
        return
      }

      if (data) {
        router.push(`/classroom/${data.id}?role=teacher`)
      }
    } catch (error) {
      console.error('Failed to create classroom:', error)
    }
  }

  const joinClassroom = async () => {
    if (!joinCode.trim()) return

    const { data, error } = await supabase
      .from('classrooms')
      .select('id')
      .eq('join_code', joinCode.trim().toUpperCase())
      .single()

    if (error || !data) {
      console.error('Classroom not found')
      return
    }

    router.push(`/join/${data.id}`)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <Image src="/logo.svg" alt="BlockDraw" width={300} height={300} className="mb-4" />

      <button
        onClick={createClassroom}
        className="w-full bg-green-500 text-white py-2 rounded mb-4">
        Create Classroom
      </button>
      <div>
        <input
          type="text"
          placeholder="Enter Class Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
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
