'use client'

import {
  SparklesIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  CogIcon,
  GlobeAltIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

export function FeaturesOverview() {
  const features = [
    {
      icon: <SparklesIcon className="h-8 w-8 text-purple-400" />,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms analyze your coding patterns, commit history, and repository structure to reveal unique personality insights.',
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30'
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-blue-400" />,
      title: 'Team Compatibility',
      description: 'Discover how team members work together, identify potential conflicts, and optimize collaboration patterns for better productivity.',
      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30'
    },
    {
      icon: <ChartBarIcon className="h-8 w-8 text-green-400" />,
      title: 'Interactive Birth Charts',
      description: 'Beautiful, interactive visualizations that map your coding personality using zodiac-inspired metaphors and planetary positions.',
      color: 'from-green-500/20 to-green-600/10 border-green-500/30'
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-red-400" />,
      title: 'Privacy First',
      description: 'We only analyze public GitHub information. Your data is processed securely and never stored without your consent.',
      color: 'from-red-500/20 to-red-600/10 border-red-500/30'
    }
  ]

  const process = [
    { step: 'Input Username', description: 'Enter your GitHub username to begin analysis' },
    { step: 'Data Collection', description: 'We fetch public repositories, commits, and activity patterns' },
    { step: 'AI Analysis', description: 'Our algorithms analyze your coding style and personality traits' },
    { step: 'Chart Generation', description: 'Receive your personalized developer birth chart with insights' }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Senior Developer',
      content: 'The team compatibility analysis helped us understand our team dynamics better than any HR tool.',
      avatar: 'SC'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Tech Lead',
      content: 'Fascinating insights into my coding patterns. The birth chart metaphor makes it so engaging!',
      avatar: 'MR'
    },
    {
      name: 'Emily Zhang',
      role: 'DevOps Engineer',
      content: 'The AI-powered analysis is surprisingly accurate. It captured my development style perfectly.',
      avatar: 'EZ'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
              Why Developers Love Birth Charts
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the perfect blend of astrology-inspired personality mapping and data-driven insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative bg-gradient-to-br ${feature.color} border rounded-xl p-6 hover:scale-105 transition-all duration-200`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-100 mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300">Get your birth chart in four simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">{item.step}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>

                {/* Connection Line */}
                {index < process.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-blue-500/50" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-4">
              Loved by Developers Worldwide
            </h2>
            <p className="text-xl text-gray-300">See what the community is saying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-100">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.content}"</p>
                <div className="flex items-center mt-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-100 mb-2">Join the Community</h3>
            <p className="text-gray-400">Discover what makes your coding style unique</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">50K+</div>
              <div className="text-gray-400">Birth Charts Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">95%</div>
              <div className="text-gray-400">User Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">1M+</div>
              <div className="text-gray-400">Commits Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-400 mb-2">150+</div>
              <div className="text-gray-400">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}