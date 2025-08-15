'use client';

import { useState } from 'react';
import PersonaSelector from '@/components/PersonaSelector';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const [selectedPersona, setSelectedPersona] = useState(null);

  const personas = [
    {
      id: 'piyush',
      name: 'Piyush Garg',
      role: 'Tech Educator & Developer',
      avatar: '/images/piyush.png',
      description: 'Content creator, educator & entrepreneur. 287K+ YouTube subscribers. Founder of Teachyst LMS. Expert in System Design & Full Stack Development.',
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-purple-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'hitesh',
      name: 'Hitesh Choudhary',
      role: 'Tech Educator & Developer',
      avatar: '/images/hitesh.png',
      description: 'Passionate tech educator and developer who loves teaching programming concepts. Let\'s learn and code together!',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'modi',
      name: 'Narendra Modi',
      role: 'Prime Minister of India',
      avatar: '🇮🇳',
      description: 'Coming Soon - Experience conversations with the Prime Minister of India. Stay tuned for this exciting new persona!',
      color: 'from-green-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-orange-50',
      borderColor: 'border-green-200',
      comingSoon: true
    }
  ];

  const handlePersonaSelect = (persona) => {
    setSelectedPersona(persona);
  };

  const handleBackToSelection = () => {
    setSelectedPersona(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {!selectedPersona ? (
        <PersonaSelector 
          personas={personas} 
          onSelectPersona={handlePersonaSelect} 
        />
      ) : (
        <ChatInterface 
          persona={selectedPersona} 
          onBack={handleBackToSelection} 
        />
      )}
    </div>
  );
}
