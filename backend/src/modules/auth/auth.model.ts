import mongoose, { Schema } from 'mongoose';
import { USER_ROLES, type UserRole } from '@best-in-flights-booking/shared-core';

export interface UserDocument {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  fullName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String },
    role: {
      type: String,
      required: true,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, isActive: 1 });

export const UserModel = mongoose.model<UserDocument>('User', userSchema);

export interface RefreshTokenDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshTokenModel = mongoose.model<RefreshTokenDocument>(
  'RefreshToken',
  refreshTokenSchema,
);
