'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'

export default function JoinPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const { data, error } = await supabase
      .from('participants')
      .insert([
        {
          classroom_id: params.id,
          name: name.trim(),
          role: 'student',
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error inserting participant:', error)
      return
    }

    if (data) {
      console.log('Successfully inserted participant:', data)
      router.push(`/classroom/${params.id}?role=student&studentId=${data.id}`)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Join Classroom
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Please enter your name to join the classroom session
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-600 mb-2">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="text-gray-600 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium">
            Join Classroom
          </button>
        </form>
      </div>
    </div>
  )
}
