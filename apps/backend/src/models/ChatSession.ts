import mongoose, { Document, Schema } from 'mongoose';

export interface IChatSession extends Document {
  sessionId: string;
  userId: string; // Reference to User _id
  bots: string[]; // Placeholder for bot IDs
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
  bots: {
    type: [String],
    default: [],
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

export const ChatSession = mongoose.model<IChatSession>(
  'ChatSession',
  ChatSessionSchema
);
