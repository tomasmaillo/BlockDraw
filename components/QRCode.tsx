import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

interface QRCodeDisplayProps {
  classroomId: string
}

const QRCodeDisplay = ({ classroomId }: QRCodeDisplayProps) => {
  const [joinCode, setJoinCode] = useState<string>('')
  const domain = typeof window !== 'undefined' ? window.location.origin : ''
  const joinUrl = `${domain}/join/${classroomId}`

  useEffect(() => {
    const fetchJoinCode = async () => {
      const { data } = await supabase
        .from('classrooms')
        .select('join_code')
        .eq('id', classroomId)
        .single()

      if (data?.join_code) {
        setJoinCode(data.join_code)
      }
    }

    fetchJoinCode()
  }, [classroomId])

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg">
      <QRCodeSVG value={joinUrl} size={200} />
      <p className="mt-4 text-sm text-gray-600">Scan to join the class</p>
      <p className="mt-2 font-mono text-sm p-2 rounded text-blue-700">
        Class code: {joinCode}
      </p>
    </div>
  )
}

export default QRCodeDisplay
