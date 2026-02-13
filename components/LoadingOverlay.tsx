import React from 'react';
import { motion } from 'framer-motion';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-20">
      <div className="relative w-32 h-32">
        <motion.div
          className="absolute inset-0 rounded-full border-t-4 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-r-4 border-secondary opacity-70"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
         <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🤖</span>
         </div>
      </div>
      <motion.p
        className="text-gray-300 font-medium text-lg animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        AI is reviewing your repositories...
      </motion.p>
    </div>
  );
};

export default LoadingOverlay;