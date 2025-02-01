'use client'

import { use } from 'react'
import TeacherDashboard from '@/components/Classroom/TeacherDashboard'
import StudentCanvas from '@/components/Classroom/StudentCanvas'
import { useSearchParams } from 'next/navigation'

export default function ClassroomPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const role = searchParams.get('role')
  const studentId = searchParams.get('studentId')
  const classroomId = use(params).id

  return (
    <div className="min-h-screen">
      <main className="w-full h-full">
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
  )
}
