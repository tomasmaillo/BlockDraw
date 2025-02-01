import { useState } from 'react'
import supabase from '@/lib/supabase'
import QRCodeDisplay from '../QRCode'
import CodeViewer from '../code-viewer'
import { exercises, Exercise } from '@/lib/exercises'

const TeacherDashboard = ({ classroomId }: { classroomId: string }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  )
  const [scores, setScores] = useState<any[]>([])

  const startExercise = async (exercise: Exercise) => {
    await supabase
      .from('classrooms')
      .update({
        test_started: true,
        current_exercise: exercise.id,
      })
      .eq('id', classroomId)
    setSelectedExercise(exercise)
  }

  return (
    <div className="min-h-screen bg-blue-500 p-8 font-montserrat">
      <h2 className="text-4xl font-bold text-white mb-16 text-center">
        Join the class! <span className="text-white"></span>
      </h2>

      <div className="flex flex-col items-center space-y-20 max-w-6xl mx-auto">
        <div className="w-full max-w-xl bg-white border-blue border-2 rounded-2xl p-8 ">
   
            <QRCodeDisplay classroomId={classroomId} />

        </div>

        {/* <div className="w-full max-w-lg">
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
        </div> */}

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
                  className="px-6 py-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
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
