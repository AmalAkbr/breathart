import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getAllExams = query({
  args: {
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const exams = await ctx.db
      .query("exams")
      .withIndex("by_created_by", (q) => q.eq("createdBy", args.adminId))
      .collect();

    return exams.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getExamDetail = query({
  args: {
    examId: v.id("exams"),
    adminId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const exam = await ctx.db.get(args.examId);
    if (!exam) {
      throw new Error("Exam not found");
    }

    if (args.adminId && exam.createdBy !== args.adminId) {
      throw new Error("You do not have permission to access this exam");
    }

    const participants = await ctx.db
      .query("examParticipants")
      .withIndex("by_exam", (q) => q.eq("examId", args.examId))
      .collect();

    const participantDetails = [];
    for (const participant of participants) {
      const user = await ctx.db.get(participant.userId);
      participantDetails.push({
        ...participant,
        user: user ? { _id: user._id, fullName: user.fullName, email: user.email } : null,
      });
    }

    return { exam, participants: participantDetails };
  },
});

export const searchStudents = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "user"))
      .collect();

    const searchTerm = args.search?.toLowerCase().trim();
    let filtered = users;

    if (searchTerm) {
      filtered = users.filter((user) =>
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    return filtered
      .map((user) => ({ _id: user._id, fullName: user.fullName, email: user.email }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  },
});

export const createExam = mutation({
  args: {
    title: v.string(),
    googleFormLink: v.string(),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const examId = await ctx.db.insert("exams", {
      title: args.title,
      googleFormLink: args.googleFormLink,
      description: args.description || null,
      createdBy: args.adminId,
      startDate: args.startDate || null,
      endDate: args.endDate || null,
      status: "draft",
      participants: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, examId };
  },
});

export const addParticipants = mutation({
  args: {
    examId: v.id("exams"),
    studentIds: v.array(v.id("users")),
    adminId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const exam = await ctx.db.get(args.examId);
    if (!exam) {
      throw new Error("Exam not found");
    }

    if (args.adminId && exam.createdBy !== args.adminId) {
      throw new Error("You do not have permission to modify this exam");
    }

    const newParticipants: any[] = [];
    const nextParticipants = [...(exam.participants || [])];
    const existingIds = new Set(nextParticipants.map((id) => id.toString()));

    for (const studentId of args.studentIds) {
      const user = await ctx.db.get(studentId);
      if (!user) {
        throw new Error("One or more students not found");
      }

      const existing = await ctx.db
        .query("examParticipants")
        .withIndex("by_exam_user", (q) => q.eq("examId", args.examId).eq("userId", studentId))
        .first();

      if (existing) continue;

      const participantId = await ctx.db.insert("examParticipants", {
        examId: args.examId,
        userId: studentId,
        userEmail: user.email,
        emailSent: false,
        submitted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      newParticipants.push({
        _id: participantId,
        examId: args.examId,
        userId: studentId,
        userEmail: user.email,
      });

      if (!existingIds.has(participantId.toString())) {
        nextParticipants.push(participantId);
        existingIds.add(participantId.toString());
      }
    }

    if (newParticipants.length > 0) {
      await ctx.db.patch(args.examId, {
        participants: nextParticipants,
        updatedAt: Date.now(),
      });
    }

    return newParticipants;
  },
});

export const sendInvitations = mutation({
  args: {
    examId: v.id("exams"),
    studentIds: v.optional(v.array(v.id("users"))),
    adminId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const exam = await ctx.db.get(args.examId);
    if (!exam) {
      throw new Error("Exam not found");
    }

    if (args.adminId && exam.createdBy !== args.adminId) {
      throw new Error("You do not have permission to send invitations for this exam");
    }

    let participants = await ctx.db
      .query("examParticipants")
      .withIndex("by_exam", (q) => q.eq("examId", args.examId))
      .collect();

    if (args.studentIds && args.studentIds.length > 0) {
      const allowed = new Set(args.studentIds.map((id) => id.toString()));
      participants = participants.filter((p) => allowed.has(p.userId.toString()));
    }

    const success = [] as string[];
    const failed = [] as string[];

    for (const participant of participants) {
      if (participant.emailSent) continue;
      const user = await ctx.db.get(participant.userId);
      if (!user) {
        failed.push(participant.userEmail);
        continue;
      }

      await ctx.db.patch(participant._id, {
        emailSent: true,
        emailSentAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Schedule the actual email to be sent via Node.js action
      await ctx.scheduler.runAfter(0, internal.emails.sendExamInvitation, {
        studentEmail: user.email,
        studentName: user.fullName,
        examDetails: {
          title: exam.title,
          googleFormLink: exam.googleFormLink,
          description: exam.description,
          startDate: exam.startDate,
          endDate: exam.endDate,
        },
      });

      success.push(user.email);
    }

    return {
      message: `Invitations marked as sent for ${success.length} student(s)`,
      results: { success, failed },
    };
  },
});

export const updateExam = mutation({
  args: {
    examId: v.id("exams"),
    title: v.optional(v.string()),
    googleFormLink: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("closed"),
        v.literal("archived")
      )
    ),
    adminId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { examId, adminId, ...updates } = args;
    const exam = await ctx.db.get(examId);
    if (!exam) {
      throw new Error("Exam not found");
    }

    if (adminId && exam.createdBy !== adminId) {
      throw new Error("You do not have permission to modify this exam");
    }

    const payload: any = { updatedAt: Date.now() };
    if (updates.title) payload.title = updates.title;
    if (updates.googleFormLink) payload.googleFormLink = updates.googleFormLink;
    if (updates.description !== undefined) payload.description = updates.description || null;
    if (updates.startDate !== undefined) payload.startDate = updates.startDate || null;
    if (updates.endDate !== undefined) payload.endDate = updates.endDate || null;
    if (updates.status) payload.status = updates.status;

    await ctx.db.patch(examId, payload);
    return { success: true };
  },
});

export const deleteExam = mutation({
  args: {
    examId: v.id("exams"),
    adminId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const exam = await ctx.db.get(args.examId);
    if (!exam) {
      throw new Error("Exam not found");
    }

    if (args.adminId && exam.createdBy !== args.adminId) {
      throw new Error("You do not have permission to delete this exam");
    }

    const participants = await ctx.db
      .query("examParticipants")
      .withIndex("by_exam", (q) => q.eq("examId", args.examId))
      .collect();

    for (const participant of participants) {
      await ctx.db.delete(participant._id);
    }

    await ctx.db.delete(args.examId);
    return { success: true, message: "Exam deleted successfully" };
  },
});

export const publishExam = mutation({
  args: {
    examId: v.id("exams"),
  },
  handler: async (ctx, args) => {
    const exam = await ctx.db.get(args.examId);
    if (!exam) {
      throw new Error("Exam not found");
    }

    await ctx.db.patch(args.examId, {
      status: "published",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getExamStats = query({
  args: {
    examId: v.id("exams"),
  },
  handler: async (ctx, args) => {
    const exam = await ctx.db.get(args.examId);
    if (!exam) {
      throw new Error("Exam not found");
    }

    const participants = await ctx.db
      .query("examParticipants")
      .withIndex("by_exam", (q) => q.eq("examId", args.examId))
      .collect();

    const submittedCount = participants.filter((p) => p.submitted).length;

    return {
      totalParticipants: participants.length,
      submittedParticipants: submittedCount,
      pendingParticipants: participants.length - submittedCount,
      submissionRate: participants.length > 0
        ? Math.round((submittedCount / participants.length) * 100)
        : 0,
    };
  },
});
