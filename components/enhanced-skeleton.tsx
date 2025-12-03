import React from 'react';
import { ChartSkeleton } from './enhanced-data-visualization';

interface EnhancedSkeletonProps {
  type: 'chart' | 'table' | 'card' | 'list' | 'text';
  height?: number;
  width?: number | string;
  showGrid?: boolean;
  animate?: boolean;
  className?: string;
  rows?: number;
  columns?: number;
  chartType?: 'line' | 'bar' | 'pie' | 'area';
}

export const EnhancedSkeleton: React.FC<EnhancedSkeletonProps> = ({
  type,
  height,
  width = '100%',
  showGrid = false,
  animate = true,
  className = '',
  rows = 3,
  columns = 4,
  chartType = 'line',
}) => {
  const baseClasses = `${animate ? 'animate-pulse' : ''} ${className}`;

  switch (type) {
    case 'chart':
      return (
        <ChartSkeleton
          height={height || 400}
          showGrid={showGrid}
          animate={animate}
          className={baseClasses}
        />
      );

    case 'table':
      return (
        <div className={`${baseClasses} space-y-3`} style={{ width }}>
          {/* Table header */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={`header-${i}`}
                className="h-4 bg-gray-200 rounded"
                style={{ width: i === 0 ? '40%' : '20%' }}
              />
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="h-3 bg-gray-100 rounded"
                  style={{
                    width: colIndex === 0 ? '30%' :
                           colIndex === columns - 1 ? '25%' :
                           `${Math.random() * 40 + 60}%`
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      );

    case 'card':
      return (
        <div className={`${baseClasses} p-6 bg-white rounded-lg shadow-sm border border-gray-200`} style={{ width }}>
          {/* Card header */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />

          {/* Card content */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/6" />
          </div>

          {/* Card footer */}
          <div className="mt-6 flex justify-between">
            <div className="h-8 bg-gray-200 rounded w-20" />
            <div className="h-8 bg-gray-200 rounded w-24" />
          </div>
        </div>
      );

    case 'list':
      return (
        <div className={`${baseClasses} space-y-4`} style={{ width }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={`list-item-${i}`} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      );

    case 'text':
      return (
        <div className={`${baseClasses} space-y-2`} style={{ width }}>
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-100 rounded w-4/6" />
          {rows > 3 && (
            <>
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </>
          )}
        </div>
      );

    default:
      return (
        <div className={`${baseClasses} h-4 bg-gray-200 rounded`} style={{ width, height }} />
      );
  }
};

// Chart-specific skeleton with different patterns for different chart types
export const ChartTypeSkeleton: React.FC<{
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  height?: number;
  animate?: boolean;
}> = ({ chartType, height = 400, animate = true }) => {
  const baseClasses = `${animate ? 'animate-pulse' : ''}`;

  switch (chartType) {
    case 'line':
    case 'area':
      return (
        <div className={`${baseClasses} relative`} style={{ height }}>
          {/* Chart area background */}
          <div className="absolute inset-0 bg-gray-50 rounded-lg" />

          {/* Grid lines */}
          <div className="absolute inset-0 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`grid-${i}`}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `${(i + 1) * 20}%` }}
              />
            ))}

            {/* Mock line chart */}
            <svg className="w-full h-full" viewBox="0 0 400 300">
              <polyline
                points="20,250 80,200 140,220 200,150 260,180 320,100 380,120"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
      );

    case 'bar':
      return (
        <div className={`${baseClasses} relative`} style={{ height }}>
          <div className="absolute inset-0 bg-gray-50 rounded-lg p-6">
            <div className="flex items-end justify-around h-full">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`bar-${i}`}
                  className="bg-gray-200 rounded-t"
                  style={{
                    width: '40px',
                    height: `${Math.random() * 60 + 20}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      );

    case 'pie':
      return (
        <div className={`${baseClasses} relative`} style={{ height }}>
          <div className="absolute inset-0 bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-center h-full">
              <div className="w-48 h-48 bg-gray-200 rounded-full relative">
                {/* Mock pie segments */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const angle = (360 / 5) * i;
                  return (
                    <div
                      key={`pie-${i}`}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(from ${angle}deg, #e5e7eb 0deg ${(360 / 5) - 2}deg, transparent ${(360 / 5) - 2}deg)`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );

    case 'scatter':
      return (
        <div className={`${baseClasses} relative`} style={{ height }}>
          <div className="absolute inset-0 bg-gray-50 rounded-lg p-6">
            <div className="relative w-full h-full">
              {/* Mock scatter points */}
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={`scatter-${i}`}
                  className="absolute w-3 h-3 bg-gray-300 rounded-full"
                  style={{
                    left: `${Math.random() * 90 + 5}%`,
                    top: `${Math.random() * 90 + 5}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return <ChartSkeleton height={height} animate={animate} />;
  }
};

// Dashboard skeleton that combines multiple skeleton types
export const DashboardSkeleton: React.FC<{
  animate?: boolean;
}> = ({ animate = true }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${animate ? 'animate-pulse' : ''} space-y-4`}>
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <EnhancedSkeleton
            key={`metric-${i}`}
            type="card"
            height={120}
            animate={animate}
          />
        ))}
      </div>

      {/* Main chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartTypeSkeleton
            chartType="line"
            height={400}
            animate={animate}
          />
        </div>
        <div>
          <ChartTypeSkeleton
            chartType="pie"
            height={400}
            animate={animate}
          />
        </div>
      </div>

      {/* Secondary charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <ChartTypeSkeleton
            key={`chart-${i}`}
            chartType={i === 0 ? 'bar' : 'area'}
            height={300}
            animate={animate}
          />
        ))}
      </div>

      {/* Table */}
      <EnhancedSkeleton
        type="table"
        height={400}
        rows={8}
        columns={5}
        animate={animate}
      />
    </div>
  );
};

export default EnhancedSkeleton;