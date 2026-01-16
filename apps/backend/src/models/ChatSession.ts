import { BotSnapshot } from '@repo/shared-types/src';
import mongoose, { Document, Schema } from 'mongoose';

export interface IChatSession extends Document {
  sessionId: string;
  userId: string;
  botsSnapshots: BotSnapshot[];
  modeId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  botsSnapshots: [
    {
      providerId: {
        type: String,
        required: true,
      },
      modelId: {
        type: String,
        required: true,
      },
      config: [
        {
          name: {
            type: String,
            required: true,
          },
          value: {
            type: Schema.Types.Mixed,
            required: true,
          },
        },
      ],
    },
  ],
  modeId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
ChatSessionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const ChatSession = mongoose.model<IChatSession>(
  'ChatSession',
  ChatSessionSchema
);
