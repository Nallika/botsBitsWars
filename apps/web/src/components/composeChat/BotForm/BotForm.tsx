'use client';

import React from 'react';

import { BotInfo } from '@repo/shared-types/src';

import { SelectBox } from '../../ui';
import { usePrepareChatStore } from '../../../stores/prepareChatStore';
import { BotField } from '../BotField/BotField';
import { SelectedBot } from '../../../types';
import styles from './styles.module.scss';

interface BotFormProps {
  botData: SelectedBot;
}

export const BotForm: React.FC<BotFormProps> = ({ botData }) => {
  const { availableProviders, updateBot } = usePrepareChatStore();
  const [ selectedProvider, setSelectedProvider ] = React.useState<BotInfo>(
    availableProviders.find(provider => provider.providerId === botData.providerId) as BotInfo
  );

  const formattedProviders = availableProviders.map(provider => ({
    value: provider.providerId,
    label: provider.providerId,
  }));

  const formattedModels = selectedProvider.botsList.map(modelId => ({
    value: modelId,
    label: modelId,
  }));

  const onProviderChange = (providerId: string) => {
    const provider = availableProviders.find(p => p.providerId === providerId);
    if (provider) {
      setSelectedProvider(provider);
    }
  }

  const onFormChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get all form data
    const formData = new FormData(e.currentTarget);
    const config: { name: string; value: number | string | boolean }[] = [];
    
    // Process form fields and convert to config array
    for (const [name, value] of formData.entries()) {
      // Find the schema for this field to determine the correct type
      const schema = selectedProvider.botConfigSchema.find(field => field.name === name);
      
      if (schema) {
        let processedValue: number | string | boolean = value as string;
        
        // Convert value based on schema type
        if (schema.type === 'number') {
          processedValue = parseFloat(value as string);
        } else if (schema.type === 'boolean') {
          processedValue = value === 'true' || value === 'on';
        }
        
        config.push({ name, value: processedValue });
      }
    }
    
    // Update bot in store with new config
    updateBot(botData.botId, { config });
  }

  const renderFields = () => {
    return (
      <>
        {selectedProvider.botConfigSchema.map((field) => {
          const fieldData = botData.config?.find(botDataField => botDataField.name === field.name);
          const schema = selectedProvider.botConfigSchema.find(schemaField => schemaField.name === field.name);

          if (!schema || schema.hidden) {
            return null;
          }

          return <BotField key={field.name} fieldData={fieldData} schema={schema} />;
        })}
      </>
    );
  };

  return (
    <form className={styles.addBotContainer} onChange={onFormChange}>
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
        data-testid="model-select"
      />
      {renderFields()}
    </form>
  );
};