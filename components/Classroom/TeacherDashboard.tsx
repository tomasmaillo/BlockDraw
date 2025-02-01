import { useState } from 'react'
import supabase from '@/lib/supabase'
import QRCodeDisplay from '../QRCode'
import CodeViewer from '../code-viewer'

const TeacherDashboard = ({ classroomId }: { classroomId: string }) => {
  const [instructions] = useState([
    'Draw a house with a tree',
    'Use at least 3 colors',
    'Add some clouds in the sky',
  ])

  const startTest = async () => {
    await supabase
      .from('classrooms')
      .update({ test_started: true })
      .eq('id', classroomId)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">
        Code Reading Exercise 🧩
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Join Instructions</h3>
          <QRCodeDisplay classroomId={classroomId} />
        </div>

        <div>
          <CodeViewer instructions={instructions} />
        </div>
      </div>

      <button
        onClick={startTest}
        className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition-all">
        Start Exercise 🚀
      </button>
    </div>
  )
}

export default TeacherDashboard
