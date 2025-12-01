'use client'

import { useState, useEffect } from 'react'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CodeBracketIcon,
  UserGroupIcon,
  ClockIcon,
  FireIcon,
  AcademicCapIcon,
  TrendingUpIcon
} from '@heroicons/react/24/outline'

interface GitHubProfileAnalysisProps {
  onBack: () => void
  onGenerateChart: () => void
}

interface RepositoryData {
  name: string
  language: string
  stars: number
  forks: number
  lastCommit: string
  size: number
}

interface LanguageData {
  name: string
  percentage: number
  color: string
  experience: string
}

interface ActivityData {
  date: string
  commits: number
  additions: number
  deletions: number
}

export function GitHubProfileAnalysis({ onBack, onGenerateChart }: GitHubProfileAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories' | 'languages' | 'activity'>('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    username: 'octocat',
    avatar: 'https://github.com/octocat.png',
    name: 'The Octocat',
    bio: 'GitHub mascot',
    location: 'San Francisco',
    followers: 3000,
    following: 9,
    totalCommits: 1847,
    totalRepos: 8,
    accountAge: '14 years'
  })

  const repositories: RepositoryData[] = [
    { name: 'Hello-World', language: 'JavaScript', stars: 1800, forks: 3400, lastCommit: '2 days ago', size: 156 },
    { name: 'Git-Scm', language: 'Shell', stars: 1200, forks: 890, lastCommit: '1 week ago', size: 512 },
    { name: 'Spoon-Knife', language: 'Ruby', stars: 1100, forks: 1200, lastCommit: '3 days ago', size: 84 },
    { name: 'Octocat-App', language: 'TypeScript', stars: 450, forks: 78, lastCommit: '5 hours ago', size: 234 }
  ]

  const languages: LanguageData[] = [
    { name: 'JavaScript', percentage: 45, color: '#f7df1e', experience: 'Expert' },
    { name: 'TypeScript', percentage: 25, color: '#3178c6', experience: 'Advanced' },
    { name: 'Python', percentage: 15, color: '#3776ab', experience: 'Intermediate' },
    { name: 'Shell', percentage: 10, color: '#89e051', experience: 'Advanced' },
    { name: 'Ruby', percentage: 5, color: '#cc342d', experience: 'Beginner' }
  ]

  const weeklyActivity: ActivityData[] = [
    { date: 'Mon', commits: 12, additions: 450, deletions: 120 },
    { date: 'Tue', commits: 8, additions: 320, deletions: 80 },
    { date: 'Wed', commits: 15, additions: 680, deletions: 200 },
    { date: 'Thu', commits: 6, additions: 280, deletions: 45 },
    { date: 'Fri', commits: 10, additions: 420, deletions: 110 },
    { date: 'Sat', commits: 4, additions: 180, deletions: 30 },
    { date: 'Sun', commits: 2, additions: 90, deletions: 15 }
  ]

  const codingPatterns = [
    {
      icon: <ClockIcon className="h-5 w-5 text-blue-400" />,
      title: 'Peak Productivity',
      description: 'Most active between 9 AM - 12 PM',
      confidence: 85
    },
    {
      icon: <FireIcon className="h-5 w-5 text-orange-400" />,
      title: 'Consistency Score',
      description: 'Commits 5-6 days per week on average',
      confidence: 92
    },
    {
      icon: <CodeBracketIcon className="h-5 w-5 text-green-400" />,
      title: 'Code Style',
      description: 'Clean, well-documented code with consistent patterns',
      confidence: 88
    },
    {
      icon: <UserGroupIcon className="h-5 w-5 text-purple-400" />,
      title: 'Collaboration',
      description: 'Active in community discussions and PR reviews',
      confidence: 76
    }
  ]

  const insights = [
    'You show strong consistency in development patterns, suggesting disciplined coding habits',
    'Your language diversity indicates adaptability and willingness to learn new technologies',
    'High contribution quality scores suggest attention to detail and best practices',
    'Community engagement patterns indicate strong collaborative skills'
  ]

  const simulateAnalysis = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setProfileData(prev => ({
        ...prev,
        totalCommits: 1847,
        totalRepos: 8,
        accountAge: '14 years'
      }))
    }, 2000)
  }

  useEffect(() => {
    simulateAnalysis()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Generator
          </button>

          <button
            onClick={onGenerateChart}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Generate Birth Chart
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className="w-24 h-24 rounded-full border-4 border-blue-500"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-gray-900" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-100">{profileData.name}</h1>
              <p className="text-xl text-blue-400 mb-2">@{profileData.username}</p>
              <p className="text-gray-300 mb-4">{profileData.bio}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-gray-400">📍 {profileData.location}</span>
                <span className="text-gray-400">👥 {profileData.followers.toLocaleString()} followers</span>
                <span className="text-gray-400">📅 {profileData.accountAge} on GitHub</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800/30 backdrop-blur border border-gray-700 rounded-lg p-1">
          {['overview', 'repositories', 'languages', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Analyzing GitHub profile...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <ChartBarIcon className="h-8 w-8 text-blue-400" />
                      <span className="text-2xl font-bold text-gray-100">{profileData.totalCommits}</span>
                    </div>
                    <p className="text-gray-400">Total Commits</p>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <CodeBracketIcon className="h-8 w-8 text-green-400" />
                      <span className="text-2xl font-bold text-gray-100">{profileData.totalRepos}</span>
                    </div>
                    <p className="text-gray-400">Repositories</p>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <UserGroupIcon className="h-8 w-8 text-purple-400" />
                      <span className="text-2xl font-bold text-gray-100">{profileData.followers.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400">Followers</p>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <AcademicCapIcon className="h-8 w-8 text-orange-400" />
                      <span className="text-2xl font-bold text-gray-100">{languages.length}</span>
                    </div>
                    <p className="text-gray-400">Languages</p>
                  </div>
                </div>

                {/* Coding Patterns */}
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
                    <TrendingUpIcon className="h-6 w-6 mr-2 text-blue-400" />
                    Coding Patterns
                  </h3>
                  <div className="space-y-4">
                    {codingPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">{pattern.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-100">{pattern.title}</h4>
                            <span className="text-sm text-gray-400">{pattern.confidence}%</span>
                          </div>
                          <p className="text-sm text-gray-400">{pattern.description}</p>
                          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              style={{ width: `${pattern.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-6">🤖 AI-Powered Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-gray-700/30 rounded-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-gray-300 text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Languages Tab */}
            {activeTab === 'languages' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-6">Language Distribution</h3>
                  <div className="space-y-4">
                    {languages.map((lang) => (
                      <div key={lang.name} className="flex items-center space-x-4">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: lang.color }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-100">{lang.name}</span>
                            <span className="text-sm text-gray-400">{lang.percentage}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${lang.percentage}%`,
                                backgroundColor: lang.color
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                          {lang.experience}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-6">Experience Timeline</h3>
                  <div className="space-y-4">
                    {languages.slice(0, 4).map((lang, index) => (
                      <div key={lang.name} className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: lang.color }}>
                          {lang.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-100">{lang.name}</h4>
                          <p className="text-sm text-gray-400">
                            {index === 0 ? 'Primary language for 8+ years' :
                             index === 1 ? 'Adopted 3 years ago' :
                             index === 2 ? 'Learning for 2 years' :
                             'Recent exploration'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-6">Weekly Activity Pattern</h3>
                <div className="grid grid-cols-7 gap-4">
                  {weeklyActivity.map((day) => (
                    <div key={day.date} className="text-center">
                      <div className="text-sm text-gray-400 mb-2">{day.date}</div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-400">{day.commits}</div>
                        <div className="text-xs text-gray-400 mt-1">commits</div>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-400">+{day.additions}</span>
                            <span className="text-red-400">-{day.deletions}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repositories Tab */}
            {activeTab === 'repositories' && (
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-6">Recent Repositories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repositories.map((repo) => (
                    <div key={repo.name} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-100">{repo.name}</h4>
                        <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                          {repo.language}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          ⭐ {repo.stars.toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          🍴 {repo.forks.toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          📦 {repo.size} KB
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Last commit: {repo.lastCommit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}