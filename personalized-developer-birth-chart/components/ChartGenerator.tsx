'use client'

import { useState } from 'react'
import {
  MagnifyingGlassIcon,
  UserIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface ChartGeneratorProps {
  onChartGenerated: () => void
  onProfileAnalyzed: () => void
}

export function ChartGenerator({ onChartGenerated, onProfileAnalyzed }: ChartGeneratorProps) {
  const [githubUsername, setGithubUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'input' | 'analyzing' | 'complete'>('input')

  const analyzeProgress = [
    { name: 'Fetching profile data', status: 'pending' },
    { name: 'Analyzing repositories', status: 'pending' },
    { name: 'Processing commit patterns', status: 'pending' },
    { name: 'Calculating personality metrics', status: 'pending' },
    { name: 'Generating birth chart', status: 'pending' }
  ]

  const [currentStep, setCurrentStep] = useState(0)

  const handleGenerate = async () => {
    if (!githubUsername.trim()) {
      setError('Please enter a GitHub username')
      return
    }

    // Basic validation
    if (githubUsername.length < 2 || githubUsername.length > 39) {
      setError('Username must be between 2 and 39 characters')
      return
    }

    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(githubUsername)) {
      setError('Invalid GitHub username format')
      return
    }

    setIsLoading(true)
    setError('')
    setStep('analyzing')

    // Simulate analysis process
    for (let i = 0; i < analyzeProgress.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setCurrentStep(i + 1)
    }

    // Complete analysis
    setTimeout(() => {
      setStep('complete')
      setIsLoading(false)
    }, 1000)
  }

  const handleContinue = () => {
    if (step === 'complete') {
      onProfileAnalyzed()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
              Generate Your Developer Birth Chart
            </h1>
            <p className="text-gray-300">
              Discover your coding personality through AI-powered analysis of your GitHub activity
            </p>
          </div>

          {step === 'input' && (
            <div className="space-y-6">
              {/* Input Form */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={githubUsername}
                    onChange={(e) => {
                      setGithubUsername(e.target.value)
                      setError('')
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="octocat"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    disabled={isLoading}
                  />
                  {githubUsername && (
                    <button
                      onClick={() => setGithubUsername('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    </button>
                  )}
                </div>
                {error && (
                  <div className="mt-2 flex items-center text-sm text-red-400">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                    {error}
                  </div>
                )}
              </div>

              {/* Sample Usernames */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Try these sample usernames:</p>
                <div className="flex flex-wrap gap-2">
                  {['octocat', 'defunkt', 'mojombo', 'pjhyett'].map((username) => (
                    <button
                      key={username}
                      onClick={() => {
                        setGithubUsername(username)
                        setError('')
                      }}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-md text-sm transition-colors"
                    >
                      {username}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isLoading || !githubUsername.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Generate Birth Chart
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>

              {/* Privacy Note */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  We only analyze public GitHub information. Your data is processed securely and never stored.
                </p>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-100 mb-2">Analyzing GitHub Profile</h3>
                <p className="text-gray-400">This may take a few moments...</p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3">
                {analyzeProgress.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      index < currentStep
                        ? 'bg-green-500/10 border border-green-500/30'
                        : index === currentStep
                        ? 'bg-blue-500/10 border border-blue-500/30'
                        : 'bg-gray-700/30 border border-gray-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      {index < currentStep ? (
                        <CheckCircleIcon className="h-4 w-4" />
                      ) : index === currentStep ? (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 bg-current rounded-full" />
                      )}
                    </div>
                    <div className={`flex-1 ${
                      index <= currentStep ? 'text-gray-100' : 'text-gray-500'
                    }`}>
                      <div className="font-medium">{step.name}</div>
                      {index === currentStep && (
                        <div className="text-sm text-blue-400">Processing...</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Analysis Insights */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="font-medium text-gray-100 mb-3 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-purple-400" />
                  AI Analysis in Progress
                </h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Scanning repository patterns and coding style</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span>Analyzing commit frequency and timing patterns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    <span>Calculating personality metrics and team compatibility</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-10 w-10 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-100 mb-2">Analysis Complete!</h3>
              <p className="text-gray-300 mb-6">
                Successfully analyzed @{githubUsername}'s GitHub profile and generated their Developer Birth Chart.
              </p>

              {/* Results Summary */}
              <div className="bg-gray-700/30 rounded-lg p-6 text-left">
                <h4 className="font-semibold text-gray-100 mb-4">Quick Results</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Personality Type:</span>
                    <span className="ml-2 text-gray-100">The Creative Architect</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Repositories:</span>
                    <span className="ml-2 text-gray-100">8 analyzed</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Commits:</span>
                    <span className="ml-2 text-gray-100">1,847 processed</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Languages:</span>
                    <span className="ml-2 text-gray-100">5 identified</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                View Detailed Analysis
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
            </div>
          )}
        </div>

        {/* Info Cards */}
        {step === 'input' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4">
              <MagnifyingGlassIcon className="h-8 w-8 text-blue-400 mb-2" />
              <h4 className="font-medium text-gray-100 mb-1">Deep Analysis</h4>
              <p className="text-sm text-gray-400">
                Comprehensive analysis of repositories, commits, and coding patterns
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4">
              <SparklesIcon className="h-8 w-8 text-purple-400 mb-2" />
              <h4 className="font-medium text-gray-100 mb-1">AI-Powered</h4>
              <p className="text-sm text-gray-400">
                Advanced machine learning models identify personality traits and patterns
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4">
              <ChartBarIcon className="h-8 w-8 text-green-400 mb-2" />
              <h4 className="font-medium text-gray-100 mb-1">Visual Insights</h4>
              <p className="text-sm text-gray-400">
                Interactive birth chart visualization with detailed personality insights
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}