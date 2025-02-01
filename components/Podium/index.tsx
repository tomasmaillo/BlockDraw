import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

type Score = {
  participant_id: string
  participant_name: string
  score: number
  time_taken: number
}

interface PodiumProps {
  scores: Score[]
  onContinue: () => void
}

const COLORS = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  other: '#A1A1AA',
}

const Podium = ({ scores, onContinue }: PodiumProps) => {
  // Sort scores by score (descending) and time_taken (ascending)
  const sortedScores = [...scores].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.time_taken - b.time_taken
  })

  // Group scores by rank (handling ties)
  const rankedScores = sortedScores.reduce((acc, score, idx) => {
    if (idx === 0) {
      acc.push([score])
      return acc
    }

    const prevScore = sortedScores[idx - 1]
    if (
      prevScore.score === score.score &&
      prevScore.time_taken === score.time_taken
    ) {
      acc[acc.length - 1].push(score)
    } else {
      acc.push([score])
    }
    return acc
  }, [] as Score[][])

  return (
    <div className="fixed inset-0 bg-blue-500 bg-opacity-95 flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-12">
        <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-4xl font-bold text-white">Round Results!</h2>
      </motion.div>

      <div className="flex justify-center items-end gap-4 mb-12">
        {rankedScores.slice(0, 5).map((rankGroup, rankIndex) => {
          const height = 150 - rankIndex * 25
          const color =
            rankIndex === 0
              ? COLORS.gold
              : rankIndex === 1
              ? COLORS.silver
              : rankIndex === 2
              ? COLORS.bronze
              : COLORS.other

          return rankGroup.map((score, groupIndex) => (
            <motion.div
              key={score.participant_id}
              className="flex flex-col items-center"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: rankIndex * 0.2 }}>
              <div className="text-white mb-2">
                <p className="font-bold">{score.participant_name}</p>
                <p className="text-sm">{score.score} points</p>
                <p className="text-xs opacity-75">{score.time_taken}s</p>
              </div>
              <div
                style={{
                  height: `${height}px`,
                  backgroundColor: color,
                  width: '80px',
                }}
                className="rounded-t-lg shadow-lg"
              />
              <div className="mt-2 text-2xl">
                {rankIndex === 0
                  ? '🥇'
                  : rankIndex === 1
                  ? '🥈'
                  : rankIndex === 2
                  ? '🥉'
                  : ''}
              </div>
            </motion.div>
          ))
        })}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={onContinue}
        className="px-8 py-4 text-xl font-bold text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors shadow-lg">
        Continue to Next Round
      </motion.button>
    </div>
  )
}

export default Podium
