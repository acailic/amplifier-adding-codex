import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Log to analytics (if available)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'error', {
        event_category: 'javascript',
        event_label: error.message,
        value: 1
      })
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-cosmic-bg flex items-center justify-center safe-area-inset">
          <div className="fixed inset-0 star-field opacity-20 pointer-events-none" />

          <div className="relative z-10 text-center max-w-md mx-auto px-4">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {/* Error Icon */}
              <div className="text-6xl md:text-8xl mb-6">💫</div>

              {/* Error Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-cosmic-text-secondary mb-8">
                We encountered an unexpected error while loading your cosmic insights.
                Don't worry, your developer DNA is still safe!
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <motion.details
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 text-left"
                >
                  <summary className="cursor-pointer text-cosmic-text-secondary hover:text-white transition-colors">
                    Error Details (Development Mode)
                  </summary>
                  <div className="mt-4 p-4 bg-cosmic-surface rounded-lg text-xs font-mono text-red-400 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </motion.details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleReload}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all no-tap-highlight"
                >
                  🔄 Try Again
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleGoHome}
                  className="px-6 py-3 bg-cosmic-surface text-white rounded-full font-semibold border border-white/20 hover:bg-white/10 transition-all no-tap-highlight"
                >
                  🏠 Go Home
                </motion.button>
              </div>

              {/* Support Info */}
              <div className="mt-8 text-cosmic-text-secondary text-sm">
                <p>If the problem persists, please:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Clear your browser cache</li>
                  <li>• Contact support if needed</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Fallback component for specific use cases
export const ErrorFallback: React.FC<{
  error?: Error
  resetError?: () => void
  message?: string
}> = ({ error, resetError, message = "Something went wrong" }) => {
  return (
    <div className="p-6 bg-cosmic-surface rounded-xl border border-red-500/20">
      <div className="flex items-start gap-4">
        <div className="text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{message}</h3>
          {error && process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="text-cosmic-text-secondary text-sm cursor-pointer">
                View error details
              </summary>
              <pre className="mt-2 text-xs text-red-400 font-mono overflow-auto">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
          {resetError && (
            <button
              onClick={resetError}
              className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary