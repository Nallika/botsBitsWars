'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';

import { BotConfigField, BotConfigSchemaField } from '@repo/shared-types/src';
import { Input, Range, Radio } from '../../ui';

interface BotFieldProps {
  fieldData?: BotConfigField;
  schema: BotConfigSchemaField;
  updateFieldData: (fieldData: BotConfigField) => void;
}

/**
 * Component represents single bot configuration field, can be either number, string or boolean
 * Renders appropriate input by provided properties
 * 
 * @param
 * - fieldData: existing field data (name, value)
 * - schema: field schema defining type, name, defaultValue, min, max, step
 */
export const BotField: React.FC<BotFieldProps> = ({ fieldData, schema, updateFieldData}) => {
  const name = fieldData?.name || schema.name;
  const [value, setValue] = useState(fieldData?.value || schema.defaultValue);

  const updateValue = useMemo(() => debounce((val: BotConfigField['value']) => {
    updateFieldData({ name, value: val });
  }, 300), []);

  const handleChange = (
    newValue: BotConfigField['value'],
  ) => {
    setValue(newValue);
    updateValue(newValue);
  };

  const renderInput = () => {
    switch (schema.type) {
      case 'number':
        // Use Range if min/max are defined, otherwise use Input
        if (schema.min !== undefined && schema.max !== undefined) {
          return (
            <Range
              name={name}
              value={value as number}
              min={schema.min}
              max={schema.max}
              step={schema.step ?? 1}
              onChange={(val) => handleChange(val)}
            />
          );
        }

        return (
          <Input
            name={name}
            type="number"
            value={value as number}
            onChange={(e) => {
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
            name={name}
            type="text"
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${schema.name}`}
            {...(schema.min !== undefined && { minLength: schema.min })}
            {...(schema.max !== undefined && { maxLength: schema.max })}
          />
        );

      case 'boolean':
        return (
          <Radio
            name={name}
            checked={value as boolean}
            onChange={(e) => handleChange(e.target.checked)}
          />
        );

      default:
        return (
          <div>
            Unsupported field type: {schema.type}
          </div>
        );
    }
  };

  return (
    <div>
      <label>
        {schema.name}
      </label>
      {renderInput()}
    </div>
  );
};