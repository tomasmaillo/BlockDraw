'use client'

import JoinClassroom from '@/components/JoinClassroom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-h-[calc(100dvh)] bg-blue-500 gap-12">
      <JoinClassroom />
    </div>
  )
}
