import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#00FF00' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Purple', value: '#800080' },
]

const SIZES = [
  { name: 'Small', value: 3 },
  { name: 'Medium', value: 6 },
  { name: 'Large', value: 10 },
]



const DrawingCanvas = ({ classroomId }: { classroomId: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState(COLORS[0].value)
  const [size, setSize] = useState(SIZES[1].value)
  const [isDrawing, setIsDrawing] = useState<boolean>(false)

  useEffect(() => {
    socket = io('/', { path: '/api/socket' })

    socket.emit('joinClassroom', classroomId, 'student')

    socket.on('drawing', onDrawingEvent)
    socket.on('testStarted', () => {
      // Initialize canvas if needed
    })

    return () => {
      socket.disconnect()
    }
  }, [classroomId])

  useEffect(() => {
    // Set canvas size based on screen size
    const canvas = canvasRef.current
    if (canvas) {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientWidth // Square canvas
      }
    }
  }, [])

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true)
    draw(e)
  }

  const endDrawing = () => {
    setIsDrawing(false)
    const ctx = canvasRef.current?.getContext('2d')
    ctx?.beginPath()
    socket.emit('finish', classroomId)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()

    let x, y
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)

    socket.emit('drawing', classroomId, { x, y, color, size })
  }

  const onDrawingEvent = (data: any) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = data.color
    ctx.lineWidth = data.size
    ctx.lineCap = 'round'
    ctx.lineTo(data.x, data.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(data.x, data.y)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Colors</h3>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-10 h-10 rounded-full border-2 ${
                  color === c.value ? 'border-black' : 'border-gray-200'
                }`}
                style={{ backgroundColor: c.value }}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Brush Size</h3>
          <div className="flex gap-2">
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSize(s.value)}
                className={`px-4 py-2 rounded ${
                  size === s.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="touch-none border-2 border-gray-200 rounded-lg w-full"
          onTouchStart={startDrawing}
          onTouchEnd={endDrawing}
          onTouchMove={draw}
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={clearCanvas}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg">
            Clear
          </button>
          <button
            onClick={() => socket.emit('finish', classroomId)}
            className="flex-1 bg-green-500 text-white py-2 rounded-lg">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default DrawingCanvas
