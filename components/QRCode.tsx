import { QRCodeSVG } from 'qrcode.react'

interface QRCodeDisplayProps {
  classroomId: string
}

const QRCodeDisplay = ({ classroomId }: QRCodeDisplayProps) => {
  // Get the current domain dynamically
  const domain = typeof window !== 'undefined' ? window.location.origin : ''
  const joinUrl = `${domain}/join/${classroomId}`

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow">
      <QRCodeSVG value={joinUrl} size={200} />
      <p className="mt-4 text-sm text-gray-600">Scan to join the class</p>
      <p className="mt-2 font-mono text-sm bg-gray-100 p-2 rounded">
        Class code: {classroomId}
      </p>
    </div>
  )
}

export default QRCodeDisplay
