import { motion, AnimatePresence } from 'framer-motion'
import { User2, Users } from 'lucide-react'

type Participant = {
  id: string
  name: string
}

interface ParticipantsListProps {
  participants: Participant[]
  currentSubmissions?: string[]
  gameStarted?: boolean
}

const ParticipantsList = ({
  participants,
  currentSubmissions = [],
  gameStarted = false,
}: ParticipantsListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl p-8">
      <AnimatePresence>
        {participants.length > 0 ? (
          participants.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg">
              <User2 className="w-5 h-5 text-neutral-300" />
              <div
                className={`w-3 h-3 rounded-full ${
                  gameStarted
                    ? currentSubmissions.includes(participant.id)
                      ? 'bg-green-500'
                      : 'bg-orange-500'
                    : 'bg-green-500'
                }`}
              />
              <span className="text-white text-lg font-montserrat font-bold">
                {participant.name}
                {gameStarted && (
                  <span className="ml-2">
                    {currentSubmissions.includes(participant.id)
                      ? '🎉 Done!'
                      : '✏️ Working...'}
                  </span>
                )}
              </span>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-gray-500 space-y-4">
            <Users className="w-12 h-12 text-white" />
            <p className="text-center text-lg text-white">
              Waiting for students to join!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ParticipantsList
