'use client'

import { useState } from 'react'
import { BirthChartVisualization } from '@/components/charts/BirthChartVisualization'
import { GitHubProfileAnalysis } from '@/components/charts/GitHubProfileAnalysis'
import { TeamCompatibility } from '@/components/charts/TeamCompatibility'
import { PremiumFeatures } from '@/components/charts/PremiumFeatures'
import { SocialSharing } from '@/components/charts/SocialSharing'
import { ChartGenerator } from '@/components/ChartGenerator'
import { HeroSection } from '@/components/HeroSection'
import { FeaturesOverview } from '@/components/FeaturesOverview'

export default function HomePage() {
  const [activeView, setActiveView] = useState<'hero' | 'generator' | 'analysis' | 'chart' | 'team' | 'premium' | 'sharing'>('hero')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {activeView === 'hero' && (
        <HeroSection onGetStarted={() => setActiveView('generator')} />
      )}

      {/* Chart Generator */}
      {activeView === 'generator' && (
        <ChartGenerator
          onChartGenerated={() => setActiveView('chart')}
          onProfileAnalyzed={() => setActiveView('analysis')}
        />
      )}

      {/* GitHub Profile Analysis */}
      {activeView === 'analysis' && (
        <GitHubProfileAnalysis
          onBack={() => setActiveView('generator')}
          onGenerateChart={() => setActiveView('chart')}
        />
      )}

      {/* Interactive Birth Chart Visualization */}
      {activeView === 'chart' && (
        <BirthChartVisualization
          onBack={() => setActiveView('generator')}
          onTeamAnalysis={() => setActiveView('team')}
          onShare={() => setActiveView('sharing')}
        />
      )}

      {/* Team Compatibility Interface */}
      {activeView === 'team' && (
        <TeamCompatibility
          onBack={() => setActiveView('chart')}
          onUpgrade={() => setActiveView('premium')}
        />
      )}

      {/* Premium Features */}
      {activeView === 'premium' && (
        <PremiumFeatures onBack={() => setActiveView('chart')} />
      )}

      {/* Social Sharing */}
      {activeView === 'sharing' && (
        <SocialSharing onBack={() => setActiveView('chart')} />
      )}

      {/* Features Overview (shown on hero) */}
      {activeView === 'hero' && <FeaturesOverview />}
    </div>
  )
}