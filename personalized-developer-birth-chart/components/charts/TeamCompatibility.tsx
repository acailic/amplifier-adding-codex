'use client'

import { useState } from 'react'
import {
  ArrowLeftIcon,
  UserPlusIcon,
  ChartBarIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  ClockIcon,
  FireIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

interface TeamCompatibilityProps {
  onBack: () => void
  onUpgrade: () => void
}

interface TeamMember {
  id: string
  username: string
  name: string
  avatar: string
  personality: string
  strengths: string[]
  weaknesses: string[]
  compatibility: number
  role: string
}

interface CompatibilityScore {
  member1: string
  member2: string
  score: number
  strengths: string[]
  challenges: string[]
  recommendations: string[]
}

interface TeamInsight {
  type: 'strength' | 'challenge' | 'opportunity'
  title: string
  description: string
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
}

export function TeamCompatibility({ onBack, onUpgrade }: TeamCompatibilityProps) {
  const [activeView, setActiveView] = useState<'overview' | 'constellation' | 'insights' | 'compatibility'>('overview')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      username: 'octocat',
      name: 'The Octocat',
      avatar: 'https://github.com/octocat.png',
      personality: 'The Creative Architect',
      strengths: ['Innovation', 'Code Quality', 'Documentation'],
      weaknesses: ['Deadline Focus', 'Delegation'],
      compatibility: 85,
      role: 'Lead Developer'
    },
    {
      id: '2',
      username: 'defunkt',
      name: 'Chris Wanstrath',
      avatar: 'https://github.com/defunkt.png',
      personality: 'The Visionary Leader',
      strengths: ['Strategy', 'Communication', 'Team Building'],
      weaknesses: ['Technical Depth', 'Micro-management'],
      compatibility: 92,
      role: 'Tech Lead'
    },
    {
      id: '3',
      username: 'mojombo',
      name: 'Tom Preston-Werner',
      avatar: 'https://github.com/mojombo.png',
      personality: 'The Systematic Thinker',
      strengths: ['Architecture', 'Problem Solving', 'Mentoring'],
      weaknesses: ['Flexibility', 'Risk Taking'],
      compatibility: 88,
      role: 'Senior Developer'
    },
    {
      id: '4',
      username: 'pjhyett',
      name: 'PJ Hyett',
      avatar: 'https://github.com/pjhyett.png',
      personality: 'The Pragmatic Builder',
      strengths: ['Execution', 'Efficiency', 'Testing'],
      weaknesses: ['Big Picture', 'Innovation'],
      compatibility: 76,
      role: 'Full Stack Developer'
    }
  ]

  const compatibilityScores: CompatibilityScore[] = [
    {
      member1: 'octocat',
      member2: 'defunkt',
      score: 92,
      strengths: ['Complementary skills', 'Shared vision', 'Strong communication'],
      challenges: ['Decision speed conflicts'],
      recommendations: ['Establish clear decision-making framework', 'Leverage creative tension for innovation']
    },
    {
      member1: 'octocat',
      member2: 'mojombo',
      score: 88,
      strengths: ['Technical alignment', 'Quality focus', 'Learning orientation'],
      challenges: ['Over-engineering tendencies'],
      recommendations: ['Set practical boundaries', 'Implement MVP-first approach']
    },
    {
      member1: 'defunkt',
      member2: 'mojombo',
      score: 95,
      strengths: ['Leadership synergy', 'Strategic alignment', 'Mentoring dynamics'],
      challenges: ['None significant'],
      recommendations: ['Continue current collaboration pattern']
    }
  ]

  const teamInsights: TeamInsight[] = [
    {
      type: 'strength',
      title: 'Strong Technical Foundation',
      description: 'Your team has excellent technical depth with complementary specializations',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
      priority: 'high'
    },
    {
      type: 'challenge',
      title: 'Communication Bottlenecks',
      description: 'Some team members may have different communication styles that need bridging',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />,
      priority: 'medium'
    },
    {
      type: 'opportunity',
      title: 'Innovation Potential',
      description: 'The creative tension between visionary and systematic thinkers drives innovation',
      icon: <LightBulbIcon className="h-5 w-5 text-blue-400" />,
      priority: 'high'
    }
  ]

  const teamMetrics = {
    overallCompatibility: 87,
    communicationScore: 78,
    technicalAlignment: 92,
    problemSolvingSynergy: 85,
    innovationPotential: 91
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getCompatibilityBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/30'
    if (score >= 75) return 'bg-blue-500/20 border-blue-500/30'
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Chart
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeView === 'overview' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('constellation')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeView === 'constellation' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Constellation
            </button>
            <button
              onClick={() => setActiveView('insights')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeView === 'insights' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Insights
            </button>
            <button
              onClick={onUpgrade}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Premium Analysis
            </button>
          </div>
        </div>

        {/* Team Header */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                Team Compatibility Analysis
              </h1>
              <p className="text-gray-300">
                Analyze team dynamics, communication patterns, and collaboration potential
              </p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getCompatibilityColor(teamMetrics.overallCompatibility)}`}>
                {teamMetrics.overallCompatibility}%
              </div>
              <p className="text-sm text-gray-400">Overall Compatibility</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-xl font-semibold text-blue-400">{teamMembers.length}</div>
              <div className="text-xs text-gray-400">Team Members</div>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-xl font-semibold text-green-400">{teamMetrics.technicalAlignment}%</div>
              <div className="text-xs text-gray-400">Tech Alignment</div>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-xl font-semibold text-purple-400">{teamMetrics.communicationScore}%</div>
              <div className="text-xs text-gray-400">Communication</div>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-xl font-semibold text-orange-400">{teamMetrics.innovationPotential}%</div>
              <div className="text-xs text-gray-400">Innovation</div>
            </div>
          </div>
        </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Team Members */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
                  <UsersIcon className="h-6 w-6 mr-2 text-blue-400" />
                  Team Members
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                        selectedMember?.id === member.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-600 bg-gray-700/20 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full border-2 border-gray-600"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-100">{member.name}</h4>
                          <p className="text-sm text-blue-400">@{member.username}</p>
                        </div>
                        <div className={`text-lg font-bold ${getCompatibilityColor(member.compatibility)}`}>
                          {member.compatibility}%
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-2 italic">{member.personality}</p>
                      <p className="text-xs text-gray-400">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Insights */}
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
                  <LightBulbIcon className="h-6 w-6 mr-2 text-yellow-400" />
                  Team Insights
                </h3>
                <div className="space-y-4">
                  {teamInsights.map((insight, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      insight.type === 'strength' ? 'border-green-500/30 bg-green-500/10' :
                      insight.type === 'challenge' ? 'border-yellow-500/30 bg-yellow-500/10' :
                      'border-blue-500/30 bg-blue-500/10'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">{insight.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-100">{insight.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              insight.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {insight.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Member Details */}
            <div className="space-y-6">
              {selectedMember && (
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">Member Details</h3>
                  <div className="flex items-center space-x-4 mb-6">
                    <img
                      src={selectedMember.avatar}
                      alt={selectedMember.name}
                      className="w-16 h-16 rounded-full border-2 border-purple-500"
                    />
                    <div>
                      <h4 className="font-medium text-gray-100">{selectedMember.name}</h4>
                      <p className="text-sm text-blue-400">@{selectedMember.username}</p>
                      <p className="text-sm text-gray-400">{selectedMember.role}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-100 mb-2">Strengths</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.strengths.map((strength, index) => (
                          <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-100 mb-2">Development Areas</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.weaknesses.map((weakness, index) => (
                          <span key={index} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                            {weakness}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Team Member */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-center">
                <UserPlusIcon className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Add Team Member</h3>
                <p className="text-white/80 mb-4">Analyze more team members for deeper insights</p>
                <button
                  onClick={onUpgrade}
                  className="px-6 py-2 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Constellation View */}
        {activeView === 'constellation' && (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-gray-100 mb-6 text-center">Team Constellation Map</h3>
            <div className="relative h-96 bg-gray-900/50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-64 h-64 mx-auto relative animate-spin-slow">
                  {/* Simplified constellation visualization */}
                  {teamMembers.map((member, index) => {
                    const angle = (index * 360) / teamMembers.length
                    const x = Math.cos((angle * Math.PI) / 180) * 100
                    const y = Math.sin((angle * Math.PI) / 180) * 100

                    return (
                      <div
                        key={member.id}
                        className="absolute w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/50"
                        style={{
                          left: `${50 + x / 2}%`,
                          top: `${50 + y / 2}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {member.name.charAt(0)}
                      </div>
                    )
                  })}
                </div>
                <p className="text-gray-400 mt-8">Interactive team constellation visualization</p>
                <p className="text-sm text-gray-500">Shows team dynamics and relationships</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Compatibility View */}
        {activeView === 'compatibility' && (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-6">Detailed Compatibility Analysis</h3>
            <div className="space-y-6">
              {compatibilityScores.map((pair, index) => (
                <div key={index} className={`border rounded-lg p-6 ${getCompatibilityBg(pair.score)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-gray-100">
                        {teamMembers.find(m => m.username === pair.member1)?.name}
                      </span>
                      <span className="text-gray-400">↔</span>
                      <span className="font-medium text-gray-100">
                        {teamMembers.find(m => m.username === pair.member2)?.name}
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${getCompatibilityColor(pair.score)}`}>
                      {pair.score}%
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-green-400 mb-2">Strengths</h5>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {pair.strengths.map((strength, i) => (
                          <li key={i}>• {strength}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-yellow-400 mb-2">Challenges</h5>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {pair.challenges.map((challenge, i) => (
                          <li key={i}>• {challenge}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-blue-400 mb-2">Recommendations</h5>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {pair.recommendations.map((rec, i) => (
                          <li key={i}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights View */}
        {activeView === 'insights' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2 text-blue-400" />
                Team Performance Metrics
              </h3>
              <div className="space-y-4">
                {Object.entries(teamMetrics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className={`font-medium ${getCompatibilityColor(value)}`}>
                        {value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
                <FireIcon className="h-6 w-6 mr-2 text-orange-400" />
                Collaboration Hotspots
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <h4 className="font-medium text-gray-100 mb-1">Code Review Excellence</h4>
                  <p className="text-sm text-gray-300">Team shows exceptional code review participation</p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="font-medium text-gray-100 mb-1">Knowledge Sharing</h4>
                  <p className="text-sm text-gray-300">Strong mentorship and documentation culture</p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="font-medium text-gray-100 mb-1">Innovation Pipeline</h4>
                  <p className="text-sm text-gray-300">Consistent delivery of creative solutions</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}