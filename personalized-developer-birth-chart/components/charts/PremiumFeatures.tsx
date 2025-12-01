'use client'

import { useState } from 'react'
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  CrownIcon,
  RocketLaunchIcon,
  StarIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface PremiumFeaturesProps {
  onBack: () => void
}

interface PricingPlan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  icon: React.ReactNode
  color: string
}

interface Feature {
  name: string
  description: string
  included: ('free' | 'starter' | 'pro' | 'team' | 'enterprise')[]
  icon: React.ReactNode
}

export function PremiumFeatures({ onBack }: PremiumFeaturesProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [isProcessing, setIsProcessing] = useState(false)

  const pricingPlans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '3 birth charts per month',
        'Basic personality insights',
        'Public repository analysis',
        'Limited team size (2 members)',
        'Community support'
      ],
      icon: <StarIcon className="h-6 w-6" />,
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 'starter',
      name: 'Starter',
      price: billingCycle === 'monthly' ? 5 : 50,
      period: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'For individual developers',
      features: [
        '25 birth charts per month',
        'Advanced personality insights',
        'Private repository access',
        'Team size up to 3 members',
        'Email support',
        'Export as PNG',
        'Basic team compatibility'
      ],
      icon: <RocketLaunchIcon className="h-6 w-6" />,
      color: 'from-blue-600 to-blue-700'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? 15 : 150,
      period: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'For professional developers',
      features: [
        '250 birth charts per month',
        'Deep personality analysis',
        'All repository types',
        'Team size up to 10 members',
        'Priority email support',
        'Export as PNG, SVG, PDF',
        'Advanced team compatibility',
        'Custom branding',
        'API access'
      ],
      highlighted: true,
      icon: <SparklesIcon className="h-6 w-6" />,
      color: 'from-purple-600 to-purple-700'
    },
    {
      id: 'team',
      name: 'Team',
      price: billingCycle === 'monthly' ? 49 : 490,
      period: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'For growing teams',
      features: [
        '1000 birth charts per month',
        'Enterprise-level analysis',
        'Unlimited repository access',
        'Team size up to 25 members',
        'Priority support with SLA',
        'All export formats',
        'Team constellation mapping',
        'Advanced collaboration insights',
        'Custom reports',
        'Team management dashboard',
        'Integration with GitHub Enterprise'
      ],
      icon: <CrownIcon className="h-6 w-6" />,
      color: 'from-pink-600 to-pink-700'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: null,
      period: 'custom',
      description: 'For large organizations',
      features: [
        'Unlimited everything',
        'Custom AI models',
        'On-premise deployment',
        'Unlimited team size',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security features',
        'SSO & advanced auth',
        'Custom branding & white-label',
        'Priority phone support',
        'Custom training & onboarding',
        'SLA guarantees'
      ],
      icon: <CrownIcon className="h-6 w-6" />,
      color: 'from-yellow-600 to-orange-600'
    }
  ]

  const allFeatures: Feature[] = [
    {
      name: 'Birth Chart Generation',
      description: 'Generate personalized developer birth charts',
      included: ['free', 'starter', 'pro', 'team', 'enterprise'],
      icon: <StarIcon className="h-5 w-5" />
    },
    {
      name: 'Advanced Personality Analysis',
      description: 'Deep insights into coding patterns and behaviors',
      included: ['pro', 'team', 'enterprise'],
      icon: <SparklesIcon className="h-5 w-5" />
    },
    {
      name: 'Team Compatibility',
      description: 'Analyze team dynamics and collaboration potential',
      included: ['starter', 'pro', 'team', 'enterprise'],
      icon: <CrownIcon className="h-5 w-5" />
    },
    {
      name: 'Private Repository Access',
      description: 'Analyze private repositories and organizations',
      included: ['starter', 'pro', 'team', 'enterprise'],
      icon: <RocketLaunchIcon className="h-5 w-5" />
    },
    {
      name: 'Export Capabilities',
      description: 'Download charts in multiple formats',
      included: ['starter', 'pro', 'team', 'enterprise'],
      icon: <CheckIcon className="h-5 w-5" />
    },
    {
      name: 'API Access',
      description: 'Integrate with your existing tools and workflows',
      included: ['pro', 'team', 'enterprise'],
      icon: <SparklesIcon className="h-5 w-5" />
    },
    {
      name: 'Priority Support',
      description: 'Get help when you need it most',
      included: ['team', 'enterprise'],
      icon: <CheckCircleIcon className="h-5 w-5" />
    }
  ]

  const handleSubscribe = (planId: string) => {
    if (planId === 'enterprise') {
      // Open contact form for enterprise
      alert('Please contact sales@devbirthchart.com for enterprise pricing')
      return
    }

    setIsProcessing(true)
    setSelectedPlan(planId)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      alert(`Successfully subscribed to ${planId} plan!`)
      setSelectedPlan(null)
    }, 2000)
  }

  const getPlanIcon = (planId: string) => {
    const plan = pricingPlans.find(p => p.id === planId)
    return plan?.icon
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Chart
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-8">
            <CrownIcon className="h-4 w-4 mr-2" />
            Unlock Your Full Potential
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
            Choose Your Plan
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Unlock advanced features, team collaboration tools, and deeper insights into your development personality.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-100' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-100' : 'text-gray-400'}`}>
              Yearly
              <span className="ml-2 text-green-400">Save 17%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 transition-all duration-200 hover:scale-105 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500 shadow-2xl shadow-purple-500/25'
                  : 'bg-gray-800/50 backdrop-blur border border-gray-700 hover:border-gray-600'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} text-white mb-4`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.description}</p>

                <div className="mb-4">
                  {plan.price !== null ? (
                    <>
                      <span className="text-4xl font-bold text-gray-100">${plan.price}</span>
                      <span className="text-gray-400">/{plan.period}</span>
                    </>
                  ) : (
                    <span className="text-xl font-semibold text-gray-100">Custom</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isProcessing || (selectedPlan === plan.id)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                } ${isProcessing && selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessing && selectedPlan === plan.id ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </span>
                ) : plan.id === 'free' ? (
                  'Current Plan'
                ) : plan.id === 'enterprise' ? (
                  'Contact Sales'
                ) : (
                  'Upgrade Now'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-100 mb-8 text-center">Feature Comparison</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-300">Feature</th>
                  {pricingPlans.map((plan) => (
                    <th key={plan.id} className="text-center py-4 px-4 text-gray-300">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((feature, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-400">{feature.icon}</div>
                        <div>
                          <div className="font-medium text-gray-100">{feature.name}</div>
                          <div className="text-sm text-gray-400">{feature.description}</div>
                        </div>
                      </div>
                    </td>
                    {pricingPlans.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-4">
                        {feature.included.includes(plan.id as any) ? (
                          <CheckIcon className="h-5 w-5 text-green-400 mx-auto" />
                        ) : (
                          <XMarkIcon className="h-5 w-5 text-gray-600 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-100 mb-8">Frequently Asked Questions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 text-left">
              <h4 className="font-semibold text-gray-100 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-300 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 text-left">
              <h4 className="font-semibold text-gray-100 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-300 text-sm">We accept all major credit cards, PayPal, and wire transfers for enterprise accounts.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 text-left">
              <h4 className="font-semibold text-gray-100 mb-2">Is there a free trial?</h4>
              <p className="text-gray-300 text-sm">The free plan includes basic features. You can upgrade to a paid plan and try all features for 14 days.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 text-left">
              <h4 className="font-semibold text-gray-100 mb-2">Do you offer discounts for annual billing?</h4>
              <p className="text-gray-300 text-sm">Yes, save 17% with annual billing on all paid plans.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}