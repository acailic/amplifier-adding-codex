/**
 * Forms Feature Wrapper
 * Омотач за функционалности форми
 */

import React from 'react';
import { FeatureErrorBoundary } from '../../app/error-boundaries';

interface FormFeatureWrapperProps {
  children: React.ReactNode;
}

export const FormFeatureWrapper: React.FC<FormFeatureWrapperProps> = ({ children }) => {
  return (
    <FeatureErrorBoundary
      feature="forms"
      enableRetry
      onError={(error, errorInfo) => {
        console.error('Forms feature error:', error, errorInfo);
      }}
    >
      <div className="forms-feature">
        {children}
      </div>
    </FeatureErrorBoundary>
  );
};