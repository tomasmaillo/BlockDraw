import { useState, useEffect } from 'react'
import supabase from '@/lib/supabase'
import QRCodeDisplay from '../QRCode'
import CodeViewer from '../code-viewer'
import { exercises } from '@/lib/exercises'
import ParticipantsList from './ParticipantsList'
import { motion } from 'framer-motion'
import Podium from '../Podium'

const TeacherDashboard = ({ classroomId }: { classroomId: string }) => {
  const [currentRound, setCurrentRound] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [participants, setParticipants] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])
  const [currentSubmissions, setCurrentSubmissions] = useState<string[]>([])
  const [allSubmitted, setAllSubmitted] = useState(false)
  const [showPracticeModal, setShowPracticeModal] = useState(false)
  const [showPodium, setShowPodium] = useState(false)

  const startGame = async () => {
    console.log('Starting game...') // Debug log
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .update({
          test_started: true,
          current_exercise_id: exercises[0].id,
          current_round: 0,
        })
        .eq('id', classroomId)
        .select()

      if (error) {
        console.error('Failed to start game:', error)
        return
      }

      console.log('Game started successfully:', data) // Debug log
      setGameStarted(true)
      setCurrentRound(0)
    } catch (error) {
      console.error('Failed to start game:', error)
    }
  }

  const handleNextRound = () => {
    setShowPodium(true)
  }

  const proceedToNextRound = async () => {
    setShowPodium(false)
    const nextRound = currentRound + 1

    if (nextRound >= exercises.length) {
      // Game is over
      const { error } = await supabase
        .from('classrooms')
        .update({
          test_started: false,
          current_exercise_id: null,
          current_round: 0,
        })
        .eq('id', classroomId)

      setGameStarted(false)
      setCurrentRound(0)
      return
    }

    const { error } = await supabase
      .from('classrooms')
      .update({
        current_exercise_id: exercises[nextRound].id,
        current_round: nextRound,
      })
      .eq('id', classroomId)

    if (error) {
      console.error('Failed to advance round:', error)
      return
    }

    setCurrentRound(nextRound)
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

  useEffect(() => {
    if (!gameStarted) return

    // Set up real-time subscription for scores
    const subscription = supabase
      .channel('scores_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scores',
          filter: `exercise_id=eq.${exercises[currentRound].id}`,
        },
        (payload) => {
          // Only process events for our classroom
          if (payload.new.classroom_id === classroomId) {
            setCurrentSubmissions((prev) => {
              const newSubmissions = [...prev, payload.new.participant_id]
              const hasAllSubmissions = participants.every((participant) =>
                newSubmissions.includes(participant.id)
              )
              setAllSubmitted(hasAllSubmissions)
              return newSubmissions
            })
          }
        }
      )
      .subscribe()

    // Initial fetch of submissions for current round
    const fetchCurrentSubmissions = async () => {
      const { data, error } = await supabase
        .from('scores')
        .select('participant_id')
        .eq('exercise_id', exercises[currentRound].id)
        .eq('classroom_id', classroomId)

      if (error) {
        console.error('Error fetching scores:', error)
        return
      }

      if (data) {
        const submittedIds = data.map((score) => score.participant_id)
        setCurrentSubmissions(submittedIds)
        // Check if all participants have submitted
        const hasAllSubmissions = participants.every((participant) =>
          submittedIds.includes(participant.id)
        )
        setAllSubmitted(hasAllSubmissions)
      }
    }

    fetchCurrentSubmissions()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [currentRound, gameStarted, participants, classroomId])

  // Add this useEffect to monitor classroom state
  useEffect(() => {
    const channel = supabase
      .channel('classroom_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classrooms',
          filter: `id=eq.${classroomId}`,
        },
        (payload) => {
          console.log('Classroom state changed:', payload) // Debug log
          if (payload.new.test_started) {
            setGameStarted(true)
            setCurrentRound(payload.new.current_round || 0)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [classroomId])

  useEffect(() => {
    if (!gameStarted) return

    // Fetch existing submissions for current round
    const fetchCurrentSubmissions = async () => {
      const { data } = await supabase
        .from('scores')
        .select('participant_id')
        .eq('exercise_id', exercises[currentRound].id)

      if (data) {
        setCurrentSubmissions(data.map((score) => score.participant_id))
      }
    }

    fetchCurrentSubmissions()

    const subscription = supabase
      .channel('scores_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scores',
          filter: `exercise_id=eq.${exercises[currentRound].id}`,
        },
        (payload) => {
          setCurrentSubmissions((prev) => [...prev, payload.new.participant_id])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [currentRound, gameStarted, participants.length])

  useEffect(() => {
    if (gameStarted && currentRound === 0) {
      setShowPracticeModal(true)
      setTimeout(() => {
        setShowPracticeModal(false)
      }, 4000) // Modal will disappear after 6 seconds
    }
  }, [gameStarted, currentRound])

  return (
    <div className="min-h-screen bg-blue-500 p-8 font-montserrat">
      {showPracticeModal && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 flex items-center justify-center z-50">
          <div className="z-100 font-bold bg-yellow-300 text-black p-4 text-center shadow-lg rounded-lg">
            Practice Round! Get ready!
          </div>
        </motion.div>
      )}
      <h2 className="text-4xl font-bold text-white mb-8 text-center">
        {gameStarted
          ? currentRound === 0
            ? 'Practice Round'
            : `Round ${currentRound + 1} of ${exercises.length}`
          : 'Join the class!'}
      </h2>

      <div className="flex flex-row items-center space-y-20 max-w-7xl mx-auto px-4">
        {!gameStarted ? (
          <>
            <div className="w-full max-w-xl bg-white border-blue border-2 rounded-2xl p-8 flex flex-col items-center">
              <QRCodeDisplay classroomId={classroomId} />

              <button
                onClick={startGame}
                className="px-8 py-4 text-xl font-bold text-white bg-green-500 rounded-full mt-12 hover:bg-green-600 transition-colors">
                Start Game
              </button>
            </div>

            <ParticipantsList participants={participants} />
          </>
        ) : (
          <>
            <div className="w-full flex gap-8">
              <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 pb-12">
                <CodeViewer
                  instructions={exercises[currentRound]?.instructions || []}
                />
              </div>

              <div className="w-80">
                <ParticipantsList
                  participants={participants}
                  currentSubmissions={currentSubmissions}
                  gameStarted={true}
                />

                {participants.every((participant) =>
                  currentSubmissions.includes(participant.id)
                ) && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNextRound}
                    className="mt-8 px-8 py-4 text-xl font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors mx-auto block">
                    Next Round
                  </motion.button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showPodium && (
        <Podium
          scores={scores
            .filter((score) => score.classroom_id === classroomId)
            .reduce(
              (acc, score) => {
                // Find existing cumulative score for this participant
                const existingScore = acc.find(
                  (s) => s.participant_id === score.participant_id
                )

                if (existingScore) {
                  // Update existing score
                  existingScore.score += score.score
                  existingScore.time_taken += score.time_taken
                } else {
                  // Add new cumulative score
                  acc.push({
                    participant_id: score.participant_id,
                    score: score.score,
                    time_taken: score.time_taken,
                  })
                }
                return acc
              },
              [] as Array<{
                participant_id: string
                score: number
                time_taken: number
              }>
            )}
          participants={participants}
          onContinue={proceedToNextRound}
          isFinalRound={currentRound === exercises.length - 1}
        />
      )}
    </div>
  )
}

export default TeacherDashboard
