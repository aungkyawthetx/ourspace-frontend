import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, Music, Image as ImageIcon, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  // Mock Data (Replace with API call later)
  const [mood, setMood] = useState('Happy');
  const daysTogether = 142;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-love-50 dark:bg-night-900 text-slate-800 dark:text-gray-100 transition-colors duration-300">
      <nav className="sticky top-0 w-full z-50 bg-white/80 dark:bg-night-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-serif font-bold text-love-600 dark:text-love-400">OurSpace</h1>
            <div className="bg-white dark:bg-night-800 px-4 py-2 rounded-full shadow-md flex items-center gap-2 border border-gray-200/50 dark:border-gray-700/50">
              <Heart size={16} className="text-love-500 fill-love-500"/>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{daysTogether} Days</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-8 pb-20">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-night-800 rounded-3xl p-8 shadow-xl mb-8 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-love-100 via-love-500 to-love-100"></div>
          <h2 className="text-3xl font-serif mb-2 text-gray-800 dark:text-gray-100">Good Morning, Alex</h2>
          <p className="text-slate-500 dark:text-slate-400">Sarah is feeling <span className="text-love-500 dark:text-love-400 font-bold">{mood}</span> today.</p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          
          {/* Card 1: Shared Tasks */}
          <motion.div variants={item} className="bg-white dark:bg-night-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><CheckCircle size={18} className="text-love-500"/> Tasks</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm opacity-60 line-through">
                <div className="w-4 h-4 border rounded bg-love-500 border-love-500"></div>
                Buy groceries
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-4 h-4 border border-love-500 rounded"></div>
                Plan weekend trip
              </li>
            </ul>
          </motion.div>

          {/* Card 2: Memories */}
          <motion.div variants={item} className="bg-white dark:bg-night-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><ImageIcon size={18} className="text-purple-500"/> Memories</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
               {/* Placeholders for images */}
               <div className="aspect-square bg-love-100 rounded-lg"></div>
               <div className="aspect-square bg-love-100 rounded-lg"></div>
               <div className="aspect-square bg-love-100 rounded-lg flex items-center justify-center text-love-500 text-xs font-bold">+5</div>
            </div>
          </motion.div>

           {/* Card 3: Music Sync */}
           <motion.div variants={item} className="md:col-span-2 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full">
                        <Music size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold">Listening Together</h3>
                        <p className="text-sm opacity-80">Lover - Taylor Swift</p>
                    </div>
                </div>
                {/* Visualizer bars animation */}
                <div className="flex gap-1 h-8 items-end">
                    <motion.div animate={{ height: [10, 30, 15] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-white rounded-full"></motion.div>
                    <motion.div animate={{ height: [20, 10, 25] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-white rounded-full"></motion.div>
                    <motion.div animate={{ height: [15, 25, 10] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1 bg-white rounded-full"></motion.div>
                </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;