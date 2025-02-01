import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'

let socket: SocketIOClient.Socket

const StudentList = ({ classroomId }: { classroomId: string }) => {
  const [students, setStudents] = useState<string[]>([])

  useEffect(() => {
    socket = io('/', { path: '/api/socket' })

    socket.emit('joinClassroom', classroomId, 'student')

    socket.on('updateParticipants', fetchParticipants)

    fetchParticipants()

    return () => {
      socket.disconnect()
    }
  }, [classroomId])

  const fetchParticipants = async () => {
    const res = await fetch(`/api/classrooms/${classroomId}`)
    const data = await res.json()
    setStudents(data.students)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Joined Students</h2>
      <ul className="list-disc pl-5">
        {students.map((student, idx) => (
          <li key={idx}>{student}</li>
        ))}
      </ul>
    </div>
  )
}

export default StudentList
