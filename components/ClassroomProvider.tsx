import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

type Participant = {
  id: string
  // Add other participant properties here
}

type ClassroomContextType = {
  participants: Participant[]
  testStarted: boolean
}

export const ClassroomProvider = ({
  classroomId,
  children,
}: {
  classroomId: string
  children: (context: ClassroomContextType) => React.ReactNode
}) => {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [testStarted, setTestStarted] = useState(false)

  useEffect(() => {
    // Subscribe to classroom changes
    const channel = supabase
      .channel(`classroom:${classroomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'classrooms',
          filter: `id=eq.${classroomId}`,
        },
        (payload) => {
          setTestStarted(payload.new.test_started)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `classroom_id=eq.${classroomId}`,
        },
        (payload) => {
          setParticipants((prev) => {
            const exists = prev.find((p) => p.id === payload.new.id)
            return exists
              ? prev.map((p) => (p.id === payload.new.id ? payload.new : p))
              : [...prev, payload.new]
          })
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [classroomId])

  return children({ participants, testStarted })
}
