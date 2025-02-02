import React from 'react';

const WaitingForNextRound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh)] p-8 bg-gradient-to-br from-blue-400 via-purple-500 to-blue-500">
      <div className="text-center p-8 bg-white rounded-[2rem] shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="animate-bounce transform rotate-45 text-4xl">
            ⏳
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Waiting for the next round...</h2>
        <p className="text-gray-600">
          Please wait while the teacher starts the next challenge!
        </p>
      </div>
    </div>
  );
};

export default WaitingForNextRound; 