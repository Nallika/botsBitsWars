'use client';

import React from 'react';

import { BaseBotConfig, ProviderInfo } from '@repo/shared-types/src';

import { SelectBox } from '../../ui';
import { useComposeChatStore } from '../../../stores/composeChatStore';
import { BotField } from '../BotField/BotField';
import { botField, SelectedBot } from '../../../types';
import styles from './styles.module.scss';

interface BotFormProps {
  botData: SelectedBot;
}

/**
 * Holds inputs for adding/configuring a single bot.
 * Sets and updates bot fields values in store.
 */
export const BotForm: React.FC<BotFormProps> = ({ botData }) => {
  const { availableProviders, updateBot } = useComposeChatStore();
  const [selectedProvider, setSelectedProvider] = React.useState<ProviderInfo>(
    availableProviders.find(
      provider => provider.providerId === botData.providerId
    ) as ProviderInfo
  );

  // @todo: pretyfy, maybe add some util formatter ?
  // Formatted values for SelectBox components
  const formattedProviders = availableProviders.map(provider => ({
    value: provider.providerId,
    label: provider.providerId,
  }));

  // Formatted models for SelectBox components
  const formattedModels = selectedProvider.botsList.map(modelId => ({
    value: modelId,
    label: modelId,
  }));

  const onProviderChange = (providerId: string) => {
    const provider = availableProviders.find(
      provider => provider.providerId === providerId
    );

    if (provider) {
      setSelectedProvider(provider);
    }
  };

  // Update single bot field in the store
  const updateBotField = (fieldData: botField) => {
    updateBot({
      botId: botData.botId,
      botConfiguration: {
        [fieldData.name]: fieldData.value,
      },
    });
  };

  const updateBotModel = (modelId: string) => {
    updateBot({ botId: botData.botId, modelId });
  };

  const renderFields = () => {
    return (
      <>
        {selectedProvider.botConfigSchema.map(field => {
          const fieldValue =
            (botData.botConfiguration &&
              botData.botConfiguration[field.name]) ||
            field.defaultValue;
          const schema = selectedProvider.botConfigSchema.find(
            schemaField => schemaField.name === field.name
          );

          if (!schema || schema.hidden) {
            return null;
          }

          return (
            <BotField
              key={field.name}
              fieldValue={fieldValue}
              schema={schema}
              updateFieldData={updateBotField}
            />
          );
        })}
      </>
    );
  };

  return (
    <div className={styles.addBotContainer}>
      <SelectBox
        options={formattedProviders}
        value={selectedProvider.providerId}
        placeholder="Select a provider..."
        onChange={onProviderChange}
        data-testid="provider-select"
      />
      <SelectBox
        options={formattedModels}
        value={botData.modelId}
        placeholder="Select a model..."
        onChange={updateBotModel}
        data-testid="model-select"
      />
      {renderFields()}
    </div>
  );
};
