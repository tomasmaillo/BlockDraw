import { div } from 'framer-motion/client'
import { useState, useEffect } from 'react'

const AnalysisOverlay = ({
  isAnalyzing,
  results,
}: {
  isAnalyzing: boolean
  results?: {
    score: number
    total: number
    timeTaken: number
    validationResults: Array<{
      rule: string
      passed: boolean
    }>
  } | null
}) => {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (results && results.score === results.total) {
      setShowConfetti(true)
    } else {
      setShowConfetti(false)
    }
  }, [results])

  if (!isAnalyzing && !results) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-8 rounded-xl max-w-md w-full text-center relative">
        {isAnalyzing ? (
          <>
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="animate-spin absolute w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full" />
              <span className="absolute inset-0 flex items-center justify-center text-4xl">
                🐝
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">
              *Buzzzzzz* Checking your drawing...
            </h3>
            <p className="text-purple-500 font-semibold">
              Hang tight! We’re seeing how well you did!
            </p>
          </>
        ) : (
          results && (
            <>
              <h3 className="text-2xl font-bold mb-4">
                {results.score === results.total
                  ? 'Perfect Score!'
                  : 'Great job!'}
              </h3>
              <div className="space-y-3 mb-6 text-left">
                {results.validationResults.map((result, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="mt-1">{result.passed ? '✅' : '❌'}</span>
                    <p className="text-sm text-gray-600">{result.rule}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Waiting for your teacher to start the next round!
              </p>
            </>
          )
        )}
      </div>
    </div>
  )
}

export default AnalysisOverlay
