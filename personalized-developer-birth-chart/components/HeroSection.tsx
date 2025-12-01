'use client'

import { useState } from 'react'
import {
  SparklesIcon,
  ChartBarIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [isDemoPlaying, setIsDemoPlaying] = useState(false)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-8 animate-float">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Discover your coding personality through GitHub analysis
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-8 leading-tight">
            Your Developer
            <br />
            <span className="relative">
              Birth Chart
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full animate-pulse-glow" />
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Uncover the hidden patterns in your coding style, team compatibility, and development personality
            through AI-powered analysis of your GitHub activity.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={onGetStarted}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
            >
              <span className="relative z-10 flex items-center justify-center">
                Generate Your Birth Chart
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => setIsDemoPlaying(true)}
              className="px-8 py-4 bg-gray-800/50 backdrop-blur border border-gray-700 hover:bg-gray-700/50 text-gray-100 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center group"
            >
              <PlayIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </button>
          </div>

          {/* Key features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Personality Insights</h3>
              <p className="text-gray-400 text-sm">Discover your coding patterns, preferred technologies, and development style</p>
            </div>

            <div className="p-6 bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <UserGroupIcon className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Team Compatibility</h3>
              <p className="text-gray-400 text-sm">Analyze team dynamics and predict collaboration patterns</p>
            </div>

            <div className="p-6 bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                <RocketLaunchIcon className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Growth Analytics</h3>
              <p className="text-gray-400 text-sm">Track your development journey and skill evolution over time</p>
            </div>
          </div>
        </div>

        {/* Demo video placeholder */}
        {isDemoPlaying && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl p-8 max-w-4xl w-full">
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PlayIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Interactive demo would play here</p>
                </div>
              </div>
              <button
                onClick={() => setIsDemoPlaying(false)}
                className="mt-6 w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors"
              >
                Close Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}