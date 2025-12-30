import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
      index: true,
    },
    expoPushToken: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    frequency: {
      type: String,
      enum: ["ONCE", "DAILY"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SENT", "FAILED"],
      default: "PENDING",
      index: true,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
}, { timestamps: true })

notificationSchema.index({
    status: 1,
    sentAt: 1
})

export const Notification = mongoose.model('Notification', notificationSchema)