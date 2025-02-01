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
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">
        Drawing Exercise 🎨
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Join Instructions</h3>
          <QRCodeDisplay classroomId={classroomId} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Select Exercise</h3>
          <div className="space-y-2">
            {exercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => startExercise(exercise)}
                className="w-full text-left p-3 rounded border hover:bg-gray-50">
                {exercise.name}
              </button>
            ))}
          </div>
        </div>

        {selectedExercise && (
          <div className="col-span-2">
            <h3 className="text-xl font-semibold mb-4">Current Exercise</h3>
            <CodeViewer instructions={selectedExercise.instructions} />
          </div>
        )}

        {scores.length > 0 && (
          <div className="col-span-2">
            <h3 className="text-xl font-semibold mb-4">Scores</h3>
            <div className="space-y-2">
              {scores.map((score) => (
                <div key={score.id} className="p-3 bg-gray-50 rounded">
                  <p>
                    {score.participant_name}: {score.score}/
                    {selectedExercise?.validationRules.length} (
                    {score.time_taken}
                    s)
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
