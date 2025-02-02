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
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                delay: index * 0.1,
                rotate: {
                  duration: 0.5,
                  delay: index * 0.1 + 0.3,
                  ease: 'easeInOut',
                  times: [0, 0.2, 0.4, 0.6, 1],
                },
              }}
              className="flex justify-center p-2 mb-3">
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-xl p-6 relative shadow-lg min-w-[300px]">
                <div className="flex items-center gap-4">
                  <User2 className="w-6 h-6 text-white/70" />
                  <span className="text-white text-2xl font-montserrat font-bold">
                    {participant.name}
                  </span>
                </div>
                {gameStarted && (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`absolute -right-2 -top-2 rounded-full px-3 py-1.5 ${
                      currentSubmissions.includes(participant.id)
                        ? 'bg-green-500'
                        : 'bg-orange-500'
                    } shadow-md`}>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={
                          currentSubmissions.includes(participant.id)
                            ? 'done'
                            : 'drawing'
                        }
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{
                          type: 'spring',
                          duration: 0.5,
                          bounce: 0.4,
                        }}
                        className="text-white text-sm font-bold flex items-center gap-1.5">
                        <span>
                          {currentSubmissions.includes(participant.id)
                            ? '🎉 '
                            : '✏️'}
                        </span>
                        {currentSubmissions.includes(participant.id)
                          ? 'Done!'
                          : 'Drawing...'}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
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
