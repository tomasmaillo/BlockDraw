import { useState, useEffect } from 'react'
import supabase from '@/lib/supabase'
import QRCodeDisplay from '../QRCode'
import CodeViewer from '../code-viewer'
import { exercises } from '@/lib/exercises'
import ParticipantsList from './ParticipantsList'
import { motion } from 'framer-motion'

// First, let's define the type for a single instruction
type Instruction = string | {
  type: string;
  content: string;
  children?: Instruction[];
};

// Update the CodeViewer component's props type
interface CodeViewerProps {
  instructions: Instruction[];
}

const TeacherDashboard = ({ classroomId }: { classroomId: string }) => {
  const [currentRound, setCurrentRound] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [participants, setParticipants] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])
  const [currentSubmissions, setCurrentSubmissions] = useState<string[]>([])
  const [allSubmitted, setAllSubmitted] = useState(false)

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

  const advanceToNextRound = async () => {
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

    const checkAllSubmitted = async () => {
      console.log('Checking submissions...')
      const { data: submittedScores, error } = await supabase
        .from('scores')
        .select('*')  // Changed to select all fields for debugging
        .eq('exercise_id', exercises[currentRound].id)

      if (error) {
        console.error('Error fetching scores:', error)
        return
      }

      // Get the participant IDs who have submitted
      const submittedParticipantIds = submittedScores?.map(score => score.participant_id) || []
      
      console.log('Debug info:')
      console.log('Current exercise ID:', exercises[currentRound].id)
      console.log('Raw submitted scores:', submittedScores)
      console.log('Submitted participant IDs:', submittedParticipantIds)
      console.log('Number of submitted scores:', submittedScores?.length)
      console.log('Number of participants:', participants.length)
      console.log('Participant IDs:', participants.map(p => p.id))

      // Check if each participant has submitted
      const hasAllSubmissions = participants.every(participant => 
        submittedParticipantIds.includes(participant.id)
      )

      console.log('Has all submissions?', hasAllSubmissions)
      
      setAllSubmitted(hasAllSubmissions)
      setCurrentSubmissions(submittedParticipantIds)
    }

    // Run checkAllSubmitted immediately when the effect runs
    checkAllSubmitted()

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
          console.log('New score submitted:', payload)
          checkAllSubmitted()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [currentRound, gameStarted, participants.length, classroomId])

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

  return (
    <div className="min-h-screen bg-blue-500 p-8 font-montserrat">
      <h2 className="text-4xl font-bold text-white mb-8 text-center">
        {gameStarted
          ? `Round ${currentRound + 1} of ${exercises.length}`
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
                 {allSubmitted && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={advanceToNextRound}
                className="mt-8 px-8 py-4 text-xl font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors mx-auto block">
                Next Round
              </motion.button>
            )}
              </div>
            </div>
            {/* <div className="text-white mt-4">
              All Submitted: {allSubmitted ? 'Yes' : 'No'}, 
              Submissions: {currentSubmissions.length}, 
              Participants: {participants.length}
            </div> */}
           
          </>
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
                      {score.score}/
                      {exercises[currentRound]?.validationRules.length}
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
