'use client'

import { useState, useRef } from 'react'
import {
  ArrowLeftIcon,
  ShareIcon,
  CameraIcon,
  DocumentDuplicateIcon,
  TwitterIcon,
  LinkIcon,
  CheckCircleIcon,
  HeartIcon,
  EyeIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface SocialSharingProps {
  onBack: () => void
}

interface SharePreview {
  platform: 'twitter' | 'linkedin' | 'email' | 'custom'
  title: string
  description: string
  image: string
  url: string
}

interface SharingStats {
  views: number
  shares: number
  likes: number
  clicks: number
  referrers: number
}

export function SocialSharing({ onBack }: SocialSharingProps) {
  const [activePreview, setActivePreview] = useState<'twitter' | 'linkedin' | 'email' | 'custom'>('twitter')
  const [shareUrl, setShareUrl] = useState('https://devbirthchart.com/chart/octocat')
  const [isCopied, setIsCopied] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const sharePreview: SharePreview = {
    platform: activePreview,
    title: "My Developer Birth Chart is in! 🚀",
    description: "Just discovered my coding personality through GitHub analysis. I'm a 'Creative Architect' - what's your developer type?",
    image: "/api/share/chart/octocat.png",
    url: shareUrl
  }

  const sharingStats: SharingStats = {
    views: 1247,
    shares: 89,
    likes: 342,
    clicks: 456,
    referrers: 23
  }

  const platforms = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <TwitterIcon className="h-5 w-5" />,
      color: 'bg-blue-500',
      preview: {
        title: "My Developer Birth Chart is in! 🚀",
        description: "Just discovered my coding personality through GitHub analysis. I'm a 'Creative Architect' - what's your developer type?\n\n#DeveloperPersonality #CodingStyle #GitHub",
        characterLimit: 280
      }
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <UserGroupIcon className="h-5 w-5" />,
      color: 'bg-blue-700',
      preview: {
        title: "Fascinating insights into my coding personality",
        description: "I just generated my Developer Birth Chart and discovered some interesting patterns in my coding style and team dynamics. The AI-powered analysis revealed I'm a 'Creative Architect' with strengths in innovation and code quality. This could be valuable for team building and professional development in the tech industry.\n\n#AI #DeveloperTools #TeamDynamics #PersonalDevelopment",
        characterLimit: 1300
      }
    },
    {
      id: 'email',
      name: 'Email',
      icon: <DocumentDuplicateIcon className="h-5 w-5" />,
      color: 'bg-gray-600',
      preview: {
        title: "Check out my Developer Birth Chart!",
        description: "Hi there,\n\nI wanted to share something fascinating I discovered - my Developer Birth Chart! It's an AI-powered analysis of my coding patterns and personality based on my GitHub activity.\n\nMy results show I'm a 'Creative Architect' with strong innovation skills and attention to code quality. The analysis includes insights about my collaboration style, technical strengths, and even team compatibility.\n\nYou can generate your own free chart at: https://devbirthchart.com\n\nWould love to see what your developer personality is!\n\nBest regards"
      }
    },
    {
      id: 'custom',
      name: 'Custom',
      icon: <SparklesIcon className="h-5 w-5" />,
      color: 'bg-purple-600',
      preview: {
        title: "Create your own message",
        description: "Write your personalized message to share your developer birth chart insights with your network."
      }
    }
  ]

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(shareUrl)
    const text = encodeURIComponent(sharePreview.description)

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
        break
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(sharePreview.title)}&body=${text}`, '_blank')
        break
      default:
        handleCopyUrl()
    }
  }

  const generateShareImage = () => {
    setIsGeneratingImage(true)

    setTimeout(() => {
      setIsGeneratingImage(false)
      // Simulate image generation
      const link = document.createElement('a')
      link.href = '/api/share/chart/octocat.png'
      link.download = 'developer-birth-chart.png'
      link.click()
    }, 2000)
  }

  const getCharacterCount = () => {
    const platform = platforms.find(p => p.id === activePreview)
    if (!platform?.preview.characterLimit) return null

    const currentLength = sharePreview.description.length
    const limit = platform.preview.characterLimit
    const percentage = (currentLength / limit) * 100

    return {
      current: currentLength,
      limit: limit,
      percentage: percentage,
      color: percentage > 90 ? 'text-red-400' : percentage > 75 ? 'text-yellow-400' : 'text-green-400'
    }
  }

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
            Back to Chart
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={generateShareImage}
              disabled={isGeneratingImage}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <CameraIcon className="h-4 w-4 mr-2" />
              {isGeneratingImage ? 'Generating...' : 'Download Image'}
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            Share Your Developer Birth Chart
          </h1>
          <p className="text-xl text-gray-300">
            Show the world your coding personality and inspire others to discover theirs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div className="space-y-6">
            {/* Platform Selector */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                <ShareIcon className="h-6 w-6 mr-2 text-blue-400" />
                Choose Platform
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setActivePreview(platform.id as any)}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-center space-x-2 ${
                      activePreview === platform.id
                        ? `${platform.color} text-white border-transparent`
                        : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {platform.icon}
                    <span className="font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Share Preview */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Preview</h3>

              {activePreview === 'twitter' && (
                <div className="bg-white text-gray-900 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      O
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Octocat</div>
                      <div className="text-gray-500 text-sm">@octocat</div>
                      <div className="mt-2 whitespace-pre-wrap">{sharePreview.description}</div>
                      {getCharacterCount() && (
                        <div className={`text-sm mt-2 ${getCharacterCount()!.color}`}>
                          {getCharacterCount()!.current}/{getCharacterCount()!.limit}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activePreview === 'linkedin' && (
                <div className="bg-white text-gray-900 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                      O
                    </div>
                    <div>
                      <div className="font-semibold">Octocat</div>
                      <div className="text-gray-500 text-sm">Software Developer</div>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap">{sharePreview.description}</p>
                </div>
              )}

              {activePreview === 'email' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Subject:</span>
                      <div className="font-semibold">{sharePreview.title}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Message:</span>
                      <div className="whitespace-pre-wrap text-gray-800">{sharePreview.description}</div>
                    </div>
                  </div>
                </div>
              )}

              {activePreview === 'custom' && (
                <div className="space-y-4">
                  <textarea
                    className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 resize-none focus:border-blue-500 focus:outline-none"
                    placeholder="Write your custom message here..."
                    defaultValue={sharePreview.description}
                  />
                </div>
              )}
            </div>

            {/* Share Actions */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Share Actions</h3>

              <div className="space-y-3">
                <button
                  onClick={() => handleShare(activePreview)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
                >
                  Share to {platforms.find(p => p.id === activePreview)?.name}
                </button>

                <button
                  onClick={handleCopyUrl}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium rounded-lg transition-colors flex items-center justify-center"
                >
                  {isCopied ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-5 w-5 mr-2" />
                      Copy Sharing Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Stats and Insights */}
          <div className="space-y-6">
            {/* Sharing Stats */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2 text-green-400" />
                Sharing Analytics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                  <EyeIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-100">{sharingStats.views.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Views</div>
                </div>

                <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                  <ShareIcon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-100">{sharingStats.shares}</div>
                  <div className="text-sm text-gray-400">Shares</div>
                </div>

                <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                  <HeartIcon className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-100">{sharingStats.likes}</div>
                  <div className="text-sm text-gray-400">Likes</div>
                </div>

                <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                  <UserGroupIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-100">{sharingStats.referrers}</div>
                  <div className="text-sm text-gray-400">Referrals</div>
                </div>
              </div>
            </div>

            {/* Referral Program */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                <SparklesIcon className="h-6 w-6 mr-2 text-purple-400" />
                Referral Program
              </h3>

              <div className="space-y-4">
                <p className="text-gray-300">
                  Share your birth chart and earn rewards! For every friend who signs up through your link:
                </p>

                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>You get 5 bonus charts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Friend gets 3 extra charts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Unlock premium features temporarily</span>
                  </li>
                </ul>

                <div className="p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Your referral code:</span>
                    <span className="font-mono text-blue-400">OCTOCAT2024</span>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText('OCTOCAT2024')}
                    className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Copy Referral Code
                  </button>
                </div>
              </div>
            </div>

            {/* Shareable Assets */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                <CameraIcon className="h-6 w-6 mr-2 text-orange-400" />
                Shareable Assets
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm text-gray-300">Chart Image</div>
                </button>
                <button className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-center">
                  <div className="text-2xl mb-2">🔮</div>
                  <div className="text-sm text-gray-300">Personality Badge</div>
                </button>
                <button className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="text-sm text-gray-300">Stats Graphic</div>
                </button>
                <button className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-center">
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="text-sm text-gray-300">Custom Theme</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}