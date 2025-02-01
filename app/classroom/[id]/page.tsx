'use client'

import { use } from 'react'
import { ClassroomProvider } from '@/components/ClassroomProvider'
import TeacherDashboard from '@/components/Classroom/TeacherDashboard'
import StudentCanvas from '@/components/Classroom/StudentCanvas'
import { useSearchParams } from 'next/navigation'

export default function ClassroomPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const role = searchParams.get('role')
  const studentId = searchParams.get('studentId')
  const classroomId = use(params).id

  return (
    <ClassroomProvider classroomId={classroomId}>
      {({ participants, testStarted }) => (
        <div className="min-h-screen bg-gray-100">

          <main className="max-w-7xl mx-auto px-4 py-8">
            {role === 'teacher' ? (
              <TeacherDashboard classroomId={classroomId} />
            ) : (
              <StudentCanvas
                classroomId={classroomId}
                studentId={studentId || ''}
              />
            )}
          </main>
        </div>
      )}
    </ClassroomProvider>
  )
}
