/**
 * Data Validation Feature Wrapper
 * Омотач за функционалност валидације података
 */

import React from 'react';
import { FeatureErrorBoundary } from '../../app/error-boundaries';

interface DataValidationFeatureWrapperProps {
  children: React.ReactNode;
}

export const DataValidationFeatureWrapper: React.FC<DataValidationFeatureWrapperProps> = ({ children }) => {
  return (
    <FeatureErrorBoundary
      feature="data-validation"
      enableRetry
      onError={(error, errorInfo) => {
        console.error('Data validation feature error:', error, errorInfo);
      }}
    >
      <div className="data-validation-feature">
        {children}
      </div>
    </FeatureErrorBoundary>
  );
};