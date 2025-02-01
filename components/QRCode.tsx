import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

interface QRCodeDisplayProps {
  classroomId: string
}

const QRCodeDisplay = ({ classroomId }: QRCodeDisplayProps) => {
  const [joinCode, setJoinCode] = useState<string>('')
  const [joinUrl, setJoinUrl] = useState<string>('')

  useEffect(() => {
    const fetchJoinCode = async () => {
      const { data } = await supabase
        .from('classrooms')
        .select('join_code')
        .eq('id', classroomId)
        .single()

      if (data?.join_code) {
        setJoinCode(data.join_code)
        const domain = typeof window !== 'undefined' ? window.location.origin : ''
        setJoinUrl(`${domain}/join/${classroomId}`)
      }
    }

    fetchJoinCode()
  }, [classroomId])

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg">
      <QRCodeSVG value={joinUrl} size={200} />
      <p className="mt-4 text-sm text-gray-600">Scan to join the class</p>
      <p className="mt-4 font-montserrat text-xl p-2 rounded text-black font-bold text-center">
        Class code: <br />
        <span className="text-2xl">{classroomId}</span>
      </p>
    </div>
  )
}

export default QRCodeDisplay
