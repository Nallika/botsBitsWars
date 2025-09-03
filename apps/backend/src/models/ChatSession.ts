import mongoose, { Document, Schema } from 'mongoose';

export interface IChatSession extends Document {
  sessionId: string;
  userId: string;
  botIds: string[];
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
  botIds: {
    type: [String],
    default: [],
  },
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
