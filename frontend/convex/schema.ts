import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    password: v.string(), // hashed password
    phone: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    isEmailVerified: v.boolean(),
    emailVerificationToken: v.optional(v.string()),
    emailVerificationExpiry: v.optional(v.number()),
    passwordResetToken: v.optional(v.string()),
    passwordResetExpiry: v.optional(v.number()),
    role: v.union(v.literal("user"), v.literal("admin")),
    isAdmin: v.boolean(),
    isActive: v.boolean(),
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  exams: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    googleFormLink: v.string(),
    createdBy: v.id("users"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("closed"),
      v.literal("archived")
    ),
    participants: v.optional(v.array(v.id("examParticipants"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_created_by", ["createdBy"])
    .index("by_status", ["status"]),

  examParticipants: defineTable({
    examId: v.id("exams"),
    userId: v.id("users"),
    userEmail: v.string(),
    emailSent: v.boolean(),
    emailSentAt: v.optional(v.number()),
    submitted: v.boolean(),
    submittedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_exam_user", ["examId", "userId"])
    .index("by_exam", ["examId"])
    .index("by_user", ["userId"])
    .index("by_email_sent", ["emailSent"]),

  videos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    thumbnail: v.string(),
    thumbnailFileId: v.optional(v.string()),
    thumbnailPath: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    videoKey: v.optional(v.string()),
    duration: v.optional(v.number()),
    category: v.union(
      v.literal("course"),
      v.literal("tutorial"),
      v.literal("webinar"),
      v.literal("demo"),
      v.literal("lecture"),
      v.literal("other")
    ),
    createdBy: v.id("users"),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    views: v.number(),
    likes: v.number(),
    tags: v.optional(v.array(v.string())),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_created_by", ["createdBy"])
    .index("by_status", ["status"])
    .index("by_category", ["category"]),
});
