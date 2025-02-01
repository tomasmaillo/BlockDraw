import { useState, useEffect } from 'react'
import supabase from '@/lib/supabase'
import QRCodeDisplay from '../QRCode'
import CodeViewer from '../code-viewer'
import { exercises, Exercise } from '@/lib/exercises'
import { Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TeacherDashboard = ({ classroomId }: { classroomId: string }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  )
  const [scores, setScores] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])

  const startExercise = async (exercise: Exercise) => {
    try {
      console.log('Starting exercise:', {
        exerciseId: exercise.id,
        classroomId,
      })

      const { error } = await supabase
        .from('classrooms')
        .update({
          test_started: true,
          current_exercise_id: exercise.id,
        })
        .eq('id', classroomId)

      if (error) {
        console.error('Failed to start exercise:', error)
        return
      }

      setSelectedExercise(exercise)
    } catch (error) {
      console.error('Failed to start exercise:', error)
    }
  }

  useEffect(() => {
    const scoresChannel = supabase
      .channel('scores')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scores',
          filter: `classroom_id=eq.${classroomId}`,
        },
        (payload) => {
          setScores((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(scoresChannel)
    }
  }, [classroomId])

  useEffect(() => {
    const syncExercises = async () => {
      const { error } = await supabase.from('exercises').upsert(
        exercises.map((ex) => ({
          id: ex.id,
          name: ex.name,
          instructions: ex.instructions,
          validation_rules: ex.validationRules,
        })),
        { onConflict: 'id' }
      )

      if (error) {
        console.error('Failed to sync exercises:', error)
      }
    }

    syncExercises()
  }, [])

  useEffect(() => {
    // First, fetch existing participants
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('classroom_id', classroomId)

      if (error) {
        console.error('Error fetching participants:', error)
        return
      }

      if (data) {
        console.log('Initial participants:', data)
        setParticipants(data)
      }
    }

    fetchParticipants()

    // Simple realtime subscription using channel
    const channel = supabase
      .channel('participants_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `classroom_id=eq.${classroomId}`,
        },
        (payload) => {
          console.log('Realtime event:', payload)
          if (payload.eventType === 'INSERT') {
            setParticipants((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'DELETE') {
            setParticipants((prev) =>
              prev.filter((p) => p.id !== payload.old.id)
            )
          } else if (payload.eventType === 'UPDATE') {
            setParticipants((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            )
          }
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [classroomId])

  return (
    <div className="min-h-screen bg-blue-500 p-8 font-montserrat">
      <h2 className="text-4xl font-bold text-white mb-16 text-center">
        Join the class! <span className="text-white"></span>
      </h2>

      <div className="flex flex-col items-center space-y-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white border-blue border-2 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-800">
              Connected Students
            </h3>
          </div>
          <AnimatePresence>
            {participants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-700">{participant.name}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {participants.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-center py-4">
              Waiting for students to join...
            </motion.p>
          )}
        </motion.div>

        <div className="w-full max-w-xl bg-white border-blue border-2 rounded-2xl p-8">
          <QRCodeDisplay classroomId={classroomId} />
        </div>

        <div className="w-full max-w-lg">
          <div className="grid grid-cols-2 gap-6">
            {exercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => startExercise(exercise)}
                className="px-6 py-5 text-center rounded-xl bg-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 text-gray-700 font-medium border border-gray-100">
                {exercise.name}
              </button>
            ))}
          </div>
        </div>

        {selectedExercise && (
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-medium mb-6 text-gray-800 text-center">
              Current Exercise
            </h3>
            <CodeViewer instructions={selectedExercise.instructions} />
          </div>
        )}

        {scores.length > 0 && (
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-medium mb-6 text-gray-800 text-center">
              Scores
            </h3>
            <div className="space-y-4">
              {scores.map((score) => (
                <div
                  key={score.id}
                  className="px-6 py-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <p className="text-gray-700 font-medium">
                    {score.participant_name}{' '}
                    <span className="text-blue-500 ml-2">
                      {score.score}/{selectedExercise?.validationRules.length}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      ({score.time_taken}s)
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherDashboard
