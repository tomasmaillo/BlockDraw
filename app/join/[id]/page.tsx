'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'
import { ArrowRight } from 'lucide-react'

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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-blue-400 via-purple-500 to-blue-500 animate-gradient">
      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Join!
        </h1>
        {/* <p className="text-black text-center mb-8 font-bold font-montserrat">
         Enter your name below
        </p> */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full border-2 border-gray-200 rounded-full px-6 py-3 text-lg focus:outline-none focus:border-blue-400 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="font-bold rounded-[2rem] w-full px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium">
            Join <ArrowRight className="inline" size={24} />
          </button>
        </form>
      </div>
    </div>
  )
}
