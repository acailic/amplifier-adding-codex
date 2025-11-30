/**
 * Serbian Data Validator Component
 * Компонента за валидацију српских података
 */

import React, { useState } from 'react';
import { Trans, msg } from '@lingui/macro';
import { useSerbianDatasetValidation } from '../../shared/hooks/useSerbian';
import { validateSerbianDataset } from '../../shared/utils/serbian-validation';
import type { SerbianValidationResult } from '../../shared/types/serbian';

interface SerbianDataValidatorProps {
  data: any[];
  textColumns?: string[];
  onValidationComplete?: (result: SerbianValidationResult) => void;
  showDetails?: boolean;
}

export const SerbianDataValidator: React.FC<SerbianDataValidatorProps> = ({
  data,
  textColumns = [],
  onValidationComplete,
  showDetails = true
}) => {
  const { validationResult, isValidating, validateDataset, clearValidation } = useSerbianDatasetValidation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleValidate = async () => {
    const result = await validateDataset(data, textColumns);
    onValidationComplete?.(result);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return <Trans>Одлично</Trans>;
    if (score >= 0.6) return <Trans>Добро</Trans>;
    if (score >= 0.4) return <Trans>Просечно</Trans>;
    return <Trans>Лоше</Trans>;
  };

  const getScriptLabel = (script: string | null) => {
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

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  if (!validationResult) {
    return (
      <div className="serbian-data-validator p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <h3 className="serbian-h3 mb-4">
            <Trans>Валидација српских података</Trans>
          </h3>
          <p className="serbian-body text-gray-600 mb-4">
            <Trans>
              Проверите квалитет и конзистентност ваших српских података
            </Trans>
          </p>
          <button
            onClick={handleValidate}
            disabled={isValidating || data.length === 0}
            className="serbian-button serbian-button-primary"
          >
            {isValidating ? (
              <Trans>Валидација у току...</Trans>
            ) : (
              <Trans>Започни валидацију</Trans>
            )}
          </button>
          {data.length === 0 && (
            <p className="serbian-caption mt-2 text-red-600">
              <Trans>Нема података за валидацију</Trans>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="serbian-data-validator p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="serbian-h3 mb-2">
            <Trans>Резултати валидације</Trans>
          </h3>
          <p className="serbian-caption text-gray-600">
            <Trans>Процесовано {data.length} записа</Trans>
          </p>
        </div>
        <button
          onClick={() => {
            clearValidation();
            setIsExpanded(false);
          }}
          className="serbian-button serbian-button-secondary text-sm"
        >
          <Trans>Очисти</Trans>
        </button>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="serbian-caption text-gray-600 mb-1">
            <Trans>Откривена скрипта</Trans>
          </h4>
          <p className="serbian-h4 text-gray-900">
            {getScriptLabel(validationResult.script_detected)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="serbian-caption text-gray-600 mb-1">
            <Trans>Конзистентност скрипте</Trans>
          </h4>
          <p className={`serbian-h4 ${getScoreColor(validationResult.script_consistency)}`}>
            {formatPercentage(validationResult.script_consistency)}
          </p>
          <p className={`serbian-caption ${getScoreColor(validationResult.script_consistency)}`}>
            {getScoreLabel(validationResult.script_consistency)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="serbian-caption text-gray-600 mb-1">
            <Trans>Српски карактери</Trans>
          </h4>
          <p className={`serbian-h4 ${getScoreColor(validationResult.serbian_language_confidence)}`}>
            {formatPercentage(validationResult.serbian_language_confidence)}
          </p>
          <p className={`serbian-caption ${getScoreColor(validationResult.serbian_language_confidence)}`}>
            {getScoreLabel(validationResult.serbian_language_confidence)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="serbian-caption text-gray-600 mb-1">
            <Trans>Формат адресе</Trans>
          </h4>
          <p className={`serbian-h4 ${getScoreColor(validationResult.address_format_score)}`}>
            {formatPercentage(validationResult.address_format_score)}
          </p>
          <p className={`serbian-caption ${getScoreColor(validationResult.address_format_score)}`}>
            {getScoreLabel(validationResult.address_format_score)}
          </p>
        </div>
      </div>

      {/* Validation Status */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              validationResult.jmbg_valid ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="serbian-body-sm">
              <Trans>ЈМБГ валидација</Trans>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              validationResult.pib_valid ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="serbian-body-sm">
              <Trans>ПИБ валидација</Trans>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              validationResult.has_serbian_chars ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="serbian-body-sm">
              <Trans>Српски карактери</Trans>
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      {showDetails && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="serbian-button serbian-button-secondary text-sm mb-4"
          >
            {isExpanded ? (
              <Trans>Сакриј детаље</Trans>
            ) : (
              <Trans>Прикажи детаље</Trans>
            )}
          </button>

          {isExpanded && (
            <div className="space-y-4">
              {/* Municipalities */}
              {(validationResult.valid_municipalities.length > 0 || validationResult.invalid_municipalities.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="serbian-heading text-green-800 mb-2">
                      <Trans>Валидне општине ({validationResult.valid_municipalities.length})</Trans>
                    </h4>
                    <div className="max-h-40 overflow-y-auto">
                      {validationResult.valid_municipalities.map((municipality, index) => (
                        <div key={index} className="serbian-body-sm text-green-700 py-1">
                          {municipality}
                        </div>
                      ))}
                    </div>
                  </div>

                  {validationResult.invalid_municipalities.length > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="serbian-heading text-yellow-800 mb-2">
                        <Trans>Потенцијалне општине ({validationResult.invalid_municipalities.length})</Trans>
                      </h4>
                      <div className="max-h-40 overflow-y-auto">
                        {validationResult.invalid_municipalities.slice(0, 20).map((municipality, index) => (
                          <div key={index} className="serbian-body-sm text-yellow-700 py-1">
                            {municipality}
                          </div>
                        ))}
                        {validationResult.invalid_municipalities.length > 20 && (
                          <div className="serbian-caption text-yellow-600 mt-2">
                            <Trans>...и још {validationResult.invalid_municipalities.length - 20}</Trans>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Place Names Sample */}
              {validationResult.place_names_found.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="serbian-heading text-blue-800 mb-2">
                    <Trans>Пронађена српска имена места ({Math.min(validationResult.place_names_found.length, 50)})</Trans>
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    {validationResult.place_names_found.slice(0, 50).map((place, index) => (
                      <span key={index} className="serbian-body-sm text-blue-700 mr-2 mb-1 inline-block bg-white px-2 py-1 rounded">
                        {place}
                      </span>
                    ))}
                    {validationResult.place_names_found.length > 50 && (
                      <div className="serbian-caption text-blue-600 mt-2">
                        <Trans>...и још {validationResult.place_names_found.length - 50}</Trans>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="serbian-heading text-blue-800 mb-3">
                  <Trans>Препоруке</Trans>
                </h4>
                <ul className="space-y-2">
                  {validationResult.script_consistency < 0.8 && (
                    <li className="serbian-body-sm text-blue-700">
                      <Trans>• Унедначите коришћење скрипте (ћирилица или латиница) за бољу конзистентност</Trans>
                    </li>
                  )}

                  {validationResult.address_format_score < 0.7 && (
                    <li className="serbian-body-sm text-blue-700">
                      <Trans>• Побо�шајте формат адреса - користите стандардни облик "Улица број, Општина"</Trans>
                    </li>
                  )}

                  {!validationResult.jmbg_valid && (
                    <li className="serbian-body-sm text-blue-700">
                      <Trans>• Проверите ЈМБГ формате - треба имати тачно 13 цифара са исправном контролном цифром</Trans>
                    </li>
                  )}

                  {!validationResult.pib_valid && (
                    <li className="serbian-body-sm text-blue-700">
                      <Trans>• Проверите ПИБ формате - треба имати 9 цифара са исправном контролном цифром</Trans>
                    </li>
                  )}

                  {validationResult.serbian_language_confidence < 0.6 && (
                    <li className="serbian-body-sm text-blue-700">
                      <Trans>• Размотрите додавање више српског садржаја или коришћење српских карактера</Trans>
                    </li>
                  )}

                  {validationResult.script_consistency >= 0.8 &&
                   validationResult.address_format_score >= 0.7 &&
                   validationResult.jmbg_valid &&
                   validationResult.pib_valid && (
                    <li className="serbian-body-sm text-green-700">
                      <Trans>✓ Одлично квалитет српских података!</Trans>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SerbianDataValidator;