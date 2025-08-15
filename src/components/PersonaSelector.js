'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function PersonaSelector({ personas, onSelectPersona }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Choose Your AI Companion
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Select a persona to start an engaging conversation with an AI that matches your interests and needs
        </p>
      </motion.div>

      {/* Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
        {personas.map((persona, index) => (
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            className="group cursor-pointer"
            onClick={() => onSelectPersona(persona)}
          >
            <div className={`
              relative overflow-hidden rounded-2xl p-6 h-80 
              ${persona.bgColor} dark:bg-slate-800
              border-2 ${persona.borderColor} dark:border-slate-700
              shadow-lg hover:shadow-2xl transition-all duration-300
              transform hover:-translate-y-2
            `}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-rose-400"></div>
              </div>

              {/* Avatar */}
              <div className="relative z-10 text-center mb-6">
                <div className={`
                  w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${persona.color}
                  flex items-center justify-center text-3xl shadow-lg
                  group-hover:scale-110 transition-transform duration-300
                  overflow-hidden
                `}>
                  {persona.avatar.startsWith('/') ? (
                    <Image 
                      src={persona.avatar} 
                      alt={persona.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${persona.avatar.startsWith('/') ? 'hidden' : ''}`}>
                    {persona.avatar}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-black mb-2">
                  {persona.name}
                </h3>
                <p className={`
                  text-sm font-medium mb-4 px-3 py-1 rounded-full inline-block
                  bg-gradient-to-r ${persona.color} text-white
                `}>
                  {persona.role}
                </p>
                <p className="text-black dark:text-black text-sm leading-relaxed">
                  {persona.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className={`
                absolute inset-0 bg-gradient-to-r ${persona.color} opacity-0
                group-hover:opacity-10 transition-opacity duration-300
              `}></div>

              {/* Selection Indicator */}
              <div className={`
                absolute top-4 right-4 w-6 h-6 rounded-full border-2
                ${persona.borderColor} dark:border-slate-600
                group-hover:bg-gradient-to-r ${persona.color}
                group-hover:border-transparent transition-all duration-300
              `}>
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-12"
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Click on any persona to start chatting
        </p>
      </motion.div>
    </div>
  );
} 