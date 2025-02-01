import { useState, useEffect } from 'react'

const AnalysisOverlay = ({
  isAnalyzing,
  results,
  onClose,
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
  }
  onClose: () => void
}) => {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (results && results.score === results.total) {
      setShowConfetti(true)
    }
  }, [results])

  if (!isAnalyzing && !results) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl max-w-md w-full text-center">
        {isAnalyzing ? (
          <>
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-bold">Analyzing your drawing...</h3>
            <p className="text-gray-500">
              Please wait while we check your work
            </p>
          </>
        ) : (
          results && (
            <>
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Add confetti animation here */}
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4">
                {results.score === results.total
                  ? 'Perfect Score! 🎉'
                  : 'Almost there!'}
              </h3>
              <div className="space-y-3 mb-6 text-left">
                {results.validationResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="mt-1">
                      {result.passed ? '✅' : '❌'}
                    </span>
                    <p className="text-sm text-gray-600">{result.rule}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 mb-6">
                Time taken: {results.timeTaken} seconds
              </p>
              <button
                onClick={onClose}
                className="bg-blue-500 text-white px-6 py-2 rounded-full">
                Continue
              </button>
            </>
          )
        )}
      </div>
    </div>
  )
}

export default AnalysisOverlay
