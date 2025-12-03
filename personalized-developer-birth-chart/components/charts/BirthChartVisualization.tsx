'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeftIcon,
  ShareIcon,
  UserGroupIcon,
  SparklesIcon,
  HeartIcon,
  CogIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  CameraIcon
} from '@heroicons/react/24/outline'

interface Planet {
  name: string
  symbol: string
  angle: number
  distance: number
  color: string
  meaning: string
  aspect: string
}

interface ZodiacSign {
  name: string
  symbol: string
  startAngle: number
  element: 'fire' | 'earth' | 'air' | 'water'
  color: string
}

interface BirthChartVisualizationProps {
  onBack: () => void
  onTeamAnalysis: () => void
  onShare: () => void
}

export function BirthChartVisualization({ onBack, onTeamAnalysis, onShare }: BirthChartVisualizationProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [chartData, setChartData] = useState({
    username: 'octocat',
    personality: 'The Creative Architect',
    generatedAt: new Date().toISOString()
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Zodiac signs configuration
  const zodiacSigns: ZodiacSign[] = [
    { name: 'Aries', symbol: '♈', startAngle: 0, element: 'fire', color: '#ef4444' },
    { name: 'Taurus', symbol: '♉', startAngle: 30, element: 'earth', color: '#84cc16' },
    { name: 'Gemini', symbol: '♊', startAngle: 60, element: 'air', color: '#fbbf24' },
    { name: 'Cancer', symbol: '♋', startAngle: 90, element: 'water', color: '#06b6d4' },
    { name: 'Leo', symbol: '♌', startAngle: 120, element: 'fire', color: '#f59e0b' },
    { name: 'Virgo', symbol: '♍', startAngle: 150, element: 'earth', color: '#84cc16' },
    { name: 'Libra', symbol: '♎', startAngle: 180, element: 'air', color: '#fbbf24' },
    { name: 'Scorpio', symbol: '♏', startAngle: 210, element: 'water', color: '#06b6d4' },
    { name: 'Sagittarius', symbol: '♐', startAngle: 240, element: 'fire', color: '#ef4444' },
    { name: 'Capricorn', symbol: '♑', startAngle: 270, element: 'earth', color: '#84cc16' },
    { name: 'Aquarius', symbol: '♒', startAngle: 300, element: 'air', color: '#fbbf24' },
    { name: 'Pisces', symbol: '♓', startAngle: 330, element: 'water', color: '#06b6d4' }
  ]

  // Planets representing coding patterns
  const planets: Planet[] = [
    {
      name: 'Mars (Energy)',
      symbol: '♂',
      angle: 45,
      distance: 60,
      color: '#ef4444',
      meaning: 'High energy coding sessions, frequent commits',
      aspect: 'Trine with Venus - Creative coding flow'
    },
    {
      name: 'Venus (Style)',
      symbol: '♀',
      angle: 135,
      distance: 80,
      color: '#f59e0b',
      meaning: 'Elegant code structure, aesthetic design patterns',
      aspect: 'Square with Jupiter - Ambitious refactoring'
    },
    {
      name: 'Jupiter (Growth)',
      symbol: '♃',
      angle: 225,
      distance: 100,
      color: '#8b5cf6',
      meaning: 'Rapid skill acquisition, learning orientation',
      aspect: 'Conjunct with Saturn - Structured growth'
    },
    {
      name: 'Saturn (Structure)',
      symbol: '♄',
      angle: 315,
      distance: 70,
      color: '#6366f1',
      meaning: 'Strong architecture focus, systematic approach',
      aspect: 'Opposition to Mercury - Planning vs spontaneity'
    },
    {
      name: 'Mercury (Logic)',
      symbol: '☿',
      angle: 90,
      distance: 90,
      color: '#06b6d4',
      meaning: 'Quick problem-solving, diverse language usage',
      aspect: 'Sextile with Mars - Energized debugging'
    }
  ]

  // Draw the birth chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = Math.min(centerX, centerY) - 40

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw zodiac wheel
    zodiacSigns.forEach((sign, index) => {
      const startAngle = (sign.startAngle * Math.PI) / 180
      const endAngle = (((sign.startAngle + 30) * Math.PI) / 180)

      // Draw sector
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, maxRadius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = sign.color + '20'
      ctx.fill()
      ctx.strokeStyle = sign.color
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw zodiac symbol
      const symbolAngle = startAngle + (endAngle - startAngle) / 2
      const symbolX = centerX + Math.cos(symbolAngle) * (maxRadius * 0.85)
      const symbolY = centerY + Math.sin(symbolAngle) * (maxRadius * 0.85)

      ctx.font = '20px serif'
      ctx.fillStyle = sign.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(sign.symbol, symbolX, symbolY)
    })

    // Draw concentric circles
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (maxRadius / 3) * i, 0, 2 * Math.PI)
      ctx.strokeStyle = '#4b5563'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw aspect lines between planets
    ctx.strokeStyle = '#6b7280'
    ctx.lineWidth = 0.5
    ctx.setLineDash([2, 4])

    planets.forEach((planet, i) => {
      planets.forEach((otherPlanet, j) => {
        if (i < j) {
          const planetAngle = (planet.angle * Math.PI) / 180
          const otherAngle = (otherPlanet.angle * Math.PI) / 180

          const planetX = centerX + Math.cos(planetAngle) * planet.distance
          const planetY = centerY + Math.sin(planetAngle) * planet.distance
          const otherX = centerX + Math.cos(otherAngle) * otherPlanet.distance
          const otherY = centerY + Math.sin(otherAngle) * otherPlanet.distance

          ctx.beginPath()
          ctx.moveTo(planetX, planetY)
          ctx.lineTo(otherX, otherY)
          ctx.stroke()
        }
      })
    })

    ctx.setLineDash([])

    // Draw planets
    planets.forEach((planet) => {
      const angle = (planet.angle * Math.PI) / 180
      const x = centerX + Math.cos(angle) * planet.distance
      const y = centerY + Math.sin(angle) * planet.distance

      // Planet circle with glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15)
      gradient.addColorStop(0, planet.color)
      gradient.addColorStop(0.5, planet.color + '80')
      gradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(x, y, 15, 0, 2 * Math.PI)
      ctx.fillStyle = gradient
      ctx.fill()

      // Planet symbol
      ctx.font = 'bold 14px serif'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(planet.symbol, x, y)

      // Planet name
      ctx.font = '10px sans-serif'
      ctx.fillStyle = '#9ca3af'
      ctx.fillText(planet.name.split('(')[0], x, y + 20)
    })

    // Draw center point
    ctx.beginPath()
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffffff'
    ctx.fill()

  }, [zodiacSigns, planets])

  const personalityInsights = [
    {
      icon: <LightBulbIcon className="h-5 w-5" />,
      title: 'Innovation Driver',
      description: 'You excel at finding creative solutions to complex problems, often introducing novel approaches that inspire your team.'
    },
    {
      icon: <HeartIcon className="h-5 w-5" />,
      title: 'Collaborative Spirit',
      description: 'Your coding style shows strong consideration for team dynamics and code maintainability.'
    },
    {
      icon: <RocketLaunchIcon className="h-5 w-5" />,
      title: 'Growth Mindset',
      description: 'You consistently challenge yourself with new technologies and complex architectures.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 p-6">
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

          <div className="flex items-center space-x-4">
            <button
              onClick={onTeamAnalysis}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Team Analysis
            </button>

            <button
              onClick={onShare}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <ShareIcon className="h-4 w-4 mr-2" />
              Share Chart
            </button>

            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg transition-colors"
            >
              <SparklesIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chart Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
            {chartData.username}'s Developer Birth Chart
          </h1>
          <p className="text-xl text-gray-300">{chartData.personality}</p>
          <p className="text-sm text-gray-500 mt-2">
            Generated on {new Date(chartData.generatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Birth Chart Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={600}
                  className={`w-full h-auto rounded-xl ${isAnimating ? 'animate-spin-slow' : ''}`}
                  style={{ maxWidth: '600px', margin: '0 auto', display: 'block' }}
                />

                {/* Selected planet tooltip */}
                {selectedPlanet && (
                  <div className="absolute top-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-xs">
                    <h4 className="font-semibold text-blue-400 mb-2">{selectedPlanet.name}</h4>
                    <p className="text-sm text-gray-300 mb-2">{selectedPlanet.meaning}</p>
                    <p className="text-xs text-gray-400">{selectedPlanet.aspect}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personality Insights */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-blue-400" />
                Coding Profile
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Activity Level</span>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-4 rounded-full ${
                          i < 4 ? 'bg-green-500' : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Code Quality</span>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-4 rounded-full ${
                          i < 5 ? 'bg-blue-500' : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Collaboration</span>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-4 rounded-full ${
                          i < 4 ? 'bg-purple-500' : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Personality Insights */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                <CogIcon className="h-5 w-5 mr-2 text-purple-400" />
                Personality Insights
              </h3>
              <div className="space-y-4">
                {personalityInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="text-blue-400 mt-1">{insight.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-100">{insight.title}</h4>
                      <p className="text-sm text-gray-400">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                <CameraIcon className="h-5 w-5 mr-2 text-green-400" />
                Export Options
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors text-sm">
                  Download as PNG
                </button>
                <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors text-sm">
                  Download as SVG
                </button>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all text-sm font-medium">
                  Upgrade for PDF Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}