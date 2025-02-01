import { useCallback, useEffect, useRef, useState } from 'react'
import supabase from '@/lib/supabase'
import AnalysisOverlay from './AnalysisOverlay'
import { RotateCcw, Trash2, Check } from 'lucide-react'

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#fe5a5a' },
  { name: 'Blue', value: '#72c1f5' },
  { name: 'Green', value: '#57d057' },

  { name: 'Orange', value: '#f9a25a' },
  { name: 'Brown', value: '#ae6c3d' },
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
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [startTime] = useState(Date.now())
  const [currentExercise, setCurrentExercise] = useState<string | null>(null)

  // Set canvas size on mount and window resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      // Get the device pixel ratio
      const dpr = window.devicePixelRatio || 1

      // Set canvas dimensions accounting for device pixel ratio
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      // Scale the canvas CSS dimensions
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      // Scale the drawing context
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const timeoutId = setTimeout(resizeCanvas, 100)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      clearTimeout(timeoutId)
    }
  }, [currentExercise])

  // Add effect to listen for exercise selection
  useEffect(() => {
    const fetchExercise = async () => {
      const { data } = await supabase
        .from('classrooms')
        .select('current_exercise_id, test_started')
        .eq('id', classroomId)
        .single()

      if (data) {
        setCurrentExercise(data.current_exercise_id)
      }
    }

    fetchExercise()

    // Subscribe to changes
    const channel = supabase
      .channel('classroom_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classrooms',
          filter: `id=eq.${classroomId}`,
        },
        (payload) => {
          setCurrentExercise(payload.new.current_exercise_id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [classroomId])

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

    let lastPoint: { x: number; y: number } | null = null

    previousState.forEach((item) => {
      if (item.type === 'dot') {
        ctx.beginPath()
        ctx.fillStyle = item.color
        ctx.arc(item.x, item.y, item.size / 2, 0, Math.PI * 2)
        ctx.fill()
        lastPoint = null
      } else if (item.type === 'line') {
        ctx.beginPath()
        ctx.strokeStyle = item.color
        ctx.lineWidth = item.size
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        if (lastPoint) {
          ctx.moveTo(lastPoint.x, lastPoint.y)
          ctx.lineTo(item.x, item.y)
          ctx.stroke()
        }

        lastPoint = { x: item.x, y: item.y }
      }
    })
  }

  const saveDrawing = useCallback(async () => {
    setIsAnalyzing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Failed to create blob')
          }
          resolve(blob)
        }, 'image/png')
      })

      // Create FormData and append all required fields
      const formData = new FormData()
      formData.append('image', blob, 'drawing.png')
      formData.append('classroomId', classroomId)

      // Log for debugging
      console.log('Sending data:', {
        classroomId,
        blobSize: blob.size,
      })

      // Send to API
      const response = await fetch('/api/analyze-drawing', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to analyze drawing')
      }

      const data = await response.json()

      const timeTaken = Math.floor((Date.now() - startTime) / 1000)

      // Save score to database
      await supabase.from('scores').insert({
        participant_id: studentId,
        exercise_id: data.exerciseId,
        score: data.score,
        time_taken: timeTaken,
      })

      setResults({
        score: data.score,
        total: data.total,
        timeTaken,
      })
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [classroomId, studentId, startTime])

  // Add a loading state when no exercise is selected
  if (!currentExercise) {
    return (
      <div className="flex items-center justify-center h-screen font-montserrat">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Waiting for teacher...</h2>
          <p className="text-gray-600">
            Please wait while the teacher starts the test!
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100dvh)] w-full bg-purple-500">
        <div className="flex flex-col flex-1 p-4 gap-4">
          <div className="flex flex-wrap gap-2 justify-between shrink-0">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-10 h-10 rounded-full border-4 ${
                  color === c.value ? 'border-yellow-300' : 'border-gray-200'
                }`}
                style={{ backgroundColor: c.value }}
                aria-label={c.name}
              />
            ))}
          </div>

          <div className="relative flex-1 min-h-0">
            <canvas
              ref={canvasRef}
              className="touch-none border-2 border-gray-200 rounded-lg w-full h-full bg-white"
              onMouseDown={startDrawing}
              onMouseUp={endDrawing}
              onMouseOut={endDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={endDrawing}
              onTouchMove={draw}
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2 h-full">
              <button
                onClick={undo}
                className="w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={drawingHistory.length === 0}>
                <RotateCcw className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={clearCanvas}
                className="w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="font-montserrat font-bold shrink-0">
            <button
              onClick={saveDrawing}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
      </div>

      <AnalysisOverlay
        isAnalyzing={isAnalyzing}
        results={results || undefined}
        onClose={() => setResults(null)}
      />
    </>
  )
}

export default StudentCanvas
