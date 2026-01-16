'use client';

import React, { useState, useMemo } from 'react';
import { debounce } from 'lodash';

import { BaseBotConfig, BotConfigSchemaField } from '@repo/shared-types/src';
import { botField } from 'apps/web/src/types';
import { Input, Range, Radio } from '../../ui';

interface BotFieldProps {
  fieldValue: BaseBotConfig['value'];
  schema: BotConfigSchemaField;
  updateFieldData: (fieldData: botField) => void;
}

// Debounce time for bot configuration field changes in milliseconds
const FIELD_CHANGE_DEBOUNCE_MS = 300;

/**
 * Component represents single bot configuration field, can be either number, string or boolean
 * Renders appropriate input by provided properties
 *
 * @param
 * - fieldValue: existing field value
 * - schema: field schema defining type, name, defaultValue, min, max, step
 */
export const BotField: React.FC<BotFieldProps> = ({
  fieldValue,
  schema,
  updateFieldData,
}) => {
  const [value, setValue] = useState(fieldValue);

  const updateValue = useMemo(
    () =>
      debounce((field: botField) => {
        updateFieldData(field);
      }, FIELD_CHANGE_DEBOUNCE_MS),
    []
  );

  const handleChange = (newValue: BaseBotConfig['value']) => {
    setValue(newValue);
    updateValue({ name: schema.name, value: newValue });
  };

  const renderInput = () => {
    switch (schema.type) {
      case 'number':
        // Use Range if min/max are defined, otherwise use Input
        if (schema.min !== undefined && schema.max !== undefined) {
          return (
            <Range
              name={schema.name}
              value={value as number}
              min={schema.min}
              max={schema.max}
              step={schema.step ?? 1}
              onChange={val => handleChange(val)}
            />
          );
        }

        return (
          <Input
            name={schema.name}
            type="number"
            value={value as number}
            onChange={e => {
              const numValue = parseFloat(e.target.value);
              if (!isNaN(numValue)) {
                handleChange(numValue);
              }
            }}
            min={schema.min}
            max={schema.max}
            step={schema.step ?? 1}
            placeholder={`Enter ${schema.name}`}
          />
        );

      case 'string':
        return (
          <Input
            name={schema.name}
            type="text"
            value={value as string}
            onChange={e => handleChange(e.target.value)}
            placeholder={`Enter ${schema.name}`}
            {...(schema.min !== undefined && { minLength: schema.min })}
            {...(schema.max !== undefined && { maxLength: schema.max })}
          />
        );

      case 'boolean':
        return (
          <Radio
            name={schema.name}
            checked={value as boolean}
            onChange={e => handleChange(e.target.checked)}
          />
        );

      default:
        return <div>Unsupported field type: {schema.type}</div>;
    }
  };

  return (
    <div>
      <label>{schema.name}</label>
      {renderInput()}
    </div>
  );
};
