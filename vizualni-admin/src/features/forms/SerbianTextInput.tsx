/**
 * Serbian Text Input Component
 * Компонента за унос српског текста
 */

import React, { useState, useRef, useEffect } from 'react';
import { Trans, msg } from '@lingui/macro';
import { useSerbianTextInput } from '../../shared/hooks/useSerbian';
import { detectScript, convertScript } from '../../shared/utils/serbian-text';
import type { SerbianScript } from '../../shared/types/serbian';

interface SerbianTextInputProps {
  value?: string;
  onChange?: (value: string, script: SerbianScript) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  scriptToggle?: boolean;
  autoDetectScript?: boolean;
  maxLength?: number;
}

export const SerbianTextInput: React.FC<SerbianTextInputProps> = ({
  value: initialValue = '',
  onChange,
  placeholder,
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  scriptToggle = true,
  autoDetectScript = true,
  maxLength
}) => {
  const {
    value,
    detectedScript,
    suggestions,
    handleChange,
    clearValue
  } = useSerbianTextInput(initialValue);

  const [showScriptToggle, setShowScriptToggle] = useState(false);
  const [currentScript, setCurrentScript] = useState<SerbianScript>('cyrillic');
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect script on mount and value changes
  useEffect(() => {
    if (autoDetectScript && value) {
      const script = detectScript(value);
      if (script !== 'none') {
        setCurrentScript(script);
      }
    }
  }, [value, autoDetectScript]);

  // Sync with external value changes
  useEffect(() => {
    if (initialValue !== value) {
      handleChange(initialValue);
    }
  }, [initialValue, handleChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    handleChange(newValue);

    if (onChange) {
      onChange(newValue, detectedScript);
    }
  };

  const toggleScript = () => {
    const targetScript = currentScript === 'cyrillic' ? 'latin' : 'cyrillic';
    setCurrentScript(targetScript);

    const convertedValue = convertScript(value, targetScript);
    handleChange(convertedValue);

    if (onChange) {
      onChange(convertedValue, targetScript);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleChange(suggestion);
    if (onChange) {
      onChange(suggestion, detectScript(suggestion));
    }
    inputRef.current?.focus();
  };

  const clearInput = () => {
    clearValue();
    if (onChange) {
      onChange('', 'none');
    }
  };

  const getScriptIcon = (script: SerbianScript) => {
    switch (script) {
      case 'cyrillic':
        return 'АБ';
      case 'latin':
        return 'AB';
      case 'mixed':
        return 'АB';
      default:
        return '?';
    }
  };

  const getScriptLabel = (script: SerbianScript) => {
    switch (script) {
      case 'cyrillic':
        return <Trans>Ћирилица</Trans>;
      case 'latin':
        return <Trans>Latinica</Trans>;
      case 'mixed':
        return <Trans>Mešovito</Trans>;
      default:
        return <Trans>Nepoznato</Trans>;
    }
  };

  return (
    <div className={`serbian-text-input-container ${className}`}>
      {label && (
        <label className="serbian-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {detectedScript !== 'none' && (
            <span className="ml-2 text-xs text-gray-500">
              ({getScriptLabel(detectedScript)})
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowScriptToggle(true)}
          onBlur={() => setShowScriptToggle(false)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`serbian-input w-full pr-20 ${
            error ? 'serbian-input-error' : ''
          } ${currentScript === 'cyrillic' ? 'serbian-cyrillic' : 'serbian-latin'}`}
        />

        {/* Input controls */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={clearInput}
              className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
              title={Trans.msg`Обриши текст`}
            >
              ×
            </button>
          )}

          {scriptToggle && showScriptToggle && detectedScript !== 'none' && (
            <button
              type="button"
              onClick={toggleScript}
              className="p-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              title={Trans.msg`Промени скрипту`}
            >
              {getScriptIcon(currentScript === 'cyrillic' ? 'latin' : 'cyrillic')}
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Error and helper text */}
      {error && (
        <p className="serbian-error-message">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="serbian-caption mt-1">
          {helperText}
        </p>
      )}

      {/* Character count */}
      {maxLength && (
        <p className="serbian-caption mt-1 text-right">
          {value.length} / {maxLength}
        </p>
      )}
    </div>
  );
};

export default SerbianTextInput;