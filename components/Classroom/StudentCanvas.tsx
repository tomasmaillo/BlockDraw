import { useCallback, useEffect, useRef, useState } from 'react'
import supabase from '@/lib/supabase'

const COLORS = [
  { name: 'Red', value: '#FF6B6B' },
  { name: 'Blue', value: '#4DABF7' },
  { name: 'Green', value: '#51CF66' },
  { name: 'Yellow', value: '#FFD43B' },
  { name: 'Purple', value: '#CC5DE8' },
  { name: 'Black', value: '#000000' },
]

const BRUSH_SIZE = 6 // Medium size

const StudentCanvas = ({
  classroomId,
  studentId,
}: {
  classroomId: string
  studentId: string
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState(COLORS[0].value)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingData, setDrawingData] = useState<any[]>([])
  const [drawingHistory, setDrawingHistory] = useState<any[][]>([])

  // Set canvas size on mount and window resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const windowHeight = window.innerHeight
      const topOffset = canvas.getBoundingClientRect().top
      const bottomPadding = 100

      canvas.width = canvas.offsetWidth
      canvas.height = Math.max(windowHeight - topOffset - bottomPadding, 300)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDrawing(true)

    // Save current state for undo
    setDrawingHistory((prev) => [...prev, [...drawingData]])

    // Draw a dot at the starting point
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ('touches' in e) {
      e.preventDefault()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = (e as React.MouseEvent).clientX - rect.left
      y = (e as React.MouseEvent).clientY - rect.top
    }

    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(x, y, BRUSH_SIZE / 2, 0, Math.PI * 2)
    ctx.fill()

    // Store the dot in drawing data
    setDrawingData((prev) => [
      ...prev,
      { type: 'dot', x, y, color, size: BRUSH_SIZE },
    ])

    // Start the path for subsequent movement
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const endDrawing = () => {
    setIsDrawing(false)
    const ctx = canvasRef.current?.getContext('2d')
    ctx?.beginPath()
  }

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ('touches' in e) {
      e.preventDefault()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = (e as React.MouseEvent).clientX - rect.left
      y = (e as React.MouseEvent).clientY - rect.top
    }

    ctx.strokeStyle = color
    ctx.lineWidth = BRUSH_SIZE
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)

    setDrawingData((prev) => [
      ...prev,
      { type: 'line', x, y, color, size: BRUSH_SIZE },
    ])
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    setDrawingHistory((prev) => [...prev, [...drawingData]])
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setDrawingData([])
  }

  const undo = () => {
    if (drawingHistory.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const previousState = drawingHistory[drawingHistory.length - 1]
    setDrawingHistory((prev) => prev.slice(0, -1))
    setDrawingData(previousState)

    // Redraw the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    previousState.forEach((item) => {
      if (item.type === 'dot') {
        ctx.beginPath()
        ctx.fillStyle = item.color
        ctx.arc(item.x, item.y, item.size / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.strokeStyle = item.color
        ctx.lineWidth = item.size
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.lineTo(item.x, item.y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(item.x, item.y)
      }
    })
  }

  const saveDrawing = useCallback(async () => {
    await supabase
      .from('participants')
      .update({
        finished: true,
        drawing_data: drawingData,
      })
      .eq('id', studentId)
  }, [drawingData, studentId])

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 justify-between">
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

        <canvas
          ref={canvasRef}
          className="touch-none border-2 border-gray-200 rounded-lg w-full bg-white"
          onMouseDown={startDrawing}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={endDrawing}
          onTouchMove={draw}
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={undo}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
            disabled={drawingHistory.length === 0}>
            Undo
          </button>
          <button
            onClick={clearCanvas}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors">
            Clear
          </button>
          <button
            onClick={saveDrawing}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentCanvas
