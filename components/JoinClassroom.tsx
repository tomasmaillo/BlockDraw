'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'
import Image from 'next/image'
import { Users } from 'lucide-react'
import { PlusCircle } from 'lucide-react'
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
    <div className="max-w-md mx-auto bg-white p-8 rounded-[2rem] shadow-lg">
      <Image src="/logo.svg" alt="BlockDraw" width={300} height={300} className="mb-8" />

      <button
        onClick={createClassroom}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full mb-4 text-lg font-medium flex items-center justify-center gap-2 transition-colors">
        <PlusCircle size={24} />
        Create Classroom
      </button>

      <div className="relative my-8 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <span className="relative px-4 bg-white text-gray-500 text-lg">or</span>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter Class Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-full px-6 py-3 text-lg focus:outline-none focus:border-blue-400 transition-colors"
          />
        <button
          onClick={joinClassroom}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full text-lg font-medium flex items-center justify-center gap-2 transition-colors">
          <Users size={24} />
          Join Classroom
        </button>
      </div>
    </div>
  )
}
