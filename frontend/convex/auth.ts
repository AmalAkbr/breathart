import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const TOKEN_EXPIRY_MINUTES = {
  emailVerify: 10,
  passwordReset: 20,
};

const APP_URL = process.env.FRONTEND_URL || "http://localhost:5173";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBuffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${salt}$100000$${hashArray}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [salt, iterations, storedHash] = hash.split("$");
    if (!salt || !iterations || !storedHash) return false;

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: encoder.encode(salt),
        iterations: parseInt(iterations, 10),
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

    const hashArray = Array.from(new Uint8Array(derivedBits))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashArray === storedHash;
  } catch {
    return false;
  }
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateRawToken(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateJWTToken(userId: string, email: string, role: string, isAdmin: boolean): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const payload = btoa(
    JSON.stringify({
      userId,
      email,
      role,
      isAdmin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    })
  )
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const signature = btoa(header + payload)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${header}.${payload}.${signature}`;
}

function sanitizeUser(user: any) {
  const {
    password,
    emailVerificationToken,
    emailVerificationExpiry,
    passwordResetToken,
    passwordResetExpiry,
    ...safe
  } = user;
  return safe;
}

export const signup = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await hashPassword(args.password);
    const rawVerificationToken = generateRawToken();
    const hashedVerificationToken = await hashToken(rawVerificationToken);

    const userId = await ctx.db.insert("users", {
      fullName: args.fullName,
      email,
      password: hashedPassword,
      role: "user",
      isAdmin: false,
      isActive: true,
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpiry: Date.now() + TOKEN_EXPIRY_MINUTES.emailVerify * 60 * 1000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const verificationUrl = `${APP_URL}/verify-email?token=${rawVerificationToken}`;

    await ctx.scheduler.runAfter(0, internal.emails.sendVerificationEmail, {
      email,
      verificationUrl,
    });

    return {
      success: true,
      message: "User registered successfully. Please verify your email.",
      userId,
      email,
      token: generateJWTToken(userId, email, "user", false),
      verificationToken: rawVerificationToken,
    };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isEmailVerified) {
      throw new Error("Please verify your email before logging in");
    }

    if (!user.isActive) {
      throw new Error("Your account has been deactivated, Please contact admin");
    }

    const isPasswordValid = await verifyPassword(args.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    await ctx.db.patch(user._id, {
      lastLogin: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Login successful",
      token: generateJWTToken(user._id, user.email, user.role, user.isAdmin),
      user: sanitizeUser(user),
    };
  },
});

export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    return sanitizeUser(user);
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    return user ? sanitizeUser(user) : null;
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });

    const updatedUser = await ctx.db.get(userId);
    return sanitizeUser(updatedUser);
  },
});

export const getAllUsers = query({
  args: {
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
  },
  handler: async (ctx, args) => {
    let users;
    if (args.role) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }

    return users.map(sanitizeUser);
  },
});

export const verifyEmail = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const hashedToken = await hashToken(args.token);
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("emailVerificationToken"), hashedToken))
      .first();

    if (!user) throw new Error("Invalid or expired verification token");
    if (user.emailVerificationExpiry && user.emailVerificationExpiry < Date.now()) {
      throw new Error("Verification token has expired");
    }

    await ctx.db.patch(user._id, {
      isEmailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpiry: undefined,
      updatedAt: Date.now(),
    });

    const refreshedUser = await ctx.db.get(user._id);
    return {
      success: true,
      message: "Email verified successfully",
      user: sanitizeUser(refreshedUser),
      token: generateJWTToken(user._id, user.email, user.role, user.isAdmin),
    };
  },
});

export const resendVerificationEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) throw new Error("User not found");
    if (user.isEmailVerified) throw new Error("Email is already verified");

    const rawVerificationToken = generateRawToken();
    const hashedVerificationToken = await hashToken(rawVerificationToken);

    await ctx.db.patch(user._id, {
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpiry: Date.now() + TOKEN_EXPIRY_MINUTES.emailVerify * 60 * 1000,
      updatedAt: Date.now(),
    });

    const verificationUrl = `${APP_URL}/verify-email?token=${rawVerificationToken}`;

    await ctx.scheduler.runAfter(0, internal.emails.sendVerificationEmail, {
      email,
      verificationUrl,
    });

    return {
      success: true,
      message: "Verification email has been resent. Please check your inbox.",
      verificationToken: rawVerificationToken,
    };
  },
});

export const forgotPassword = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      return {
        success: true,
        message: "If email exists, password reset instructions have been sent",
      };
    }

    const rawResetToken = generateRawToken();
    const hashedResetToken = await hashToken(rawResetToken);

    await ctx.db.patch(user._id, {
      passwordResetToken: hashedResetToken,
      passwordResetExpiry: Date.now() + TOKEN_EXPIRY_MINUTES.passwordReset * 60 * 1000,
      updatedAt: Date.now(),
    });

    const resetUrl = `${APP_URL}/reset-password?token=${rawResetToken}`;

    await ctx.scheduler.runAfter(0, internal.emails.sendPasswordResetEmail, {
      email,
      resetUrl,
      resetToken: rawResetToken,
    });

    return {
      success: true,
      message: "Password reset instructions have been sent to your email",
      resetToken: rawResetToken,
    };
  },
});

export const verifyResetToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const hashedToken = await hashToken(args.token);
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("passwordResetToken"), hashedToken))
      .first();

    if (!user) throw new Error("Invalid reset token");
    if (user.passwordResetExpiry && user.passwordResetExpiry < Date.now()) {
      throw new Error("Reset token has expired");
    }

    return {
      success: true,
      message: "Token is valid",
      userId: user._id,
      email: user.email,
    };
  },
});

export const resetPassword = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
    confirmPassword: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.confirmPassword && args.newPassword !== args.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const hashedToken = await hashToken(args.token);
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("passwordResetToken"), hashedToken))
      .first();

    if (!user) throw new Error("Invalid or expired reset token");
    if (user.passwordResetExpiry && user.passwordResetExpiry < Date.now()) {
      throw new Error("Reset token has expired");
    }

    const hashedPassword = await hashPassword(args.newPassword);

    await ctx.db.patch(user._id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpiry: undefined,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
      userId: user._id,
      email: user.email,
    };
  },
});

export const getProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    return sanitizeUser(user);
  },
});

export const getExamNotifications = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("examParticipants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const notifications = [];
    for (const participant of participants) {
      if (!participant.emailSent) continue;
      const exam = await ctx.db.get(participant.examId);
      if (!exam) continue;

      notifications.push({
        participantId: participant._id,
        examId: exam._id,
        title: exam.title,
        description: exam.description,
        googleFormLink: exam.googleFormLink,
        startDate: exam.startDate,
        endDate: exam.endDate,
        examStatus: exam.status,
        emailSentAt: participant.emailSentAt,
        submitted: participant.submitted,
        submittedAt: participant.submittedAt,
        createdAt: participant.createdAt,
      });
    }

    return notifications.sort((a, b) => (b.emailSentAt || 0) - (a.emailSentAt || 0));
  },
});

export const enableAdmin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "admin") throw new Error("User does not have admin role assigned");

    if (!user.isAdmin) {
      await ctx.db.patch(user._id, {
        isAdmin: true,
        isActive: true,
        updatedAt: Date.now(),
      });
    }

    const updatedUser = await ctx.db.get(user._id);
    return {
      success: true,
      message: "Admin privileges enabled",
      user: sanitizeUser(updatedUser),
    };
  },
});

export const updateUserAdmin = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    isActive: v.optional(v.boolean()),
    isEmailVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const updatePayload: any = { ...updates, updatedAt: Date.now() };
    if (updatePayload.email) {
      updatePayload.email = updatePayload.email.toLowerCase();
    }

    await ctx.db.patch(userId, updatePayload);
    const updatedUser = await ctx.db.get(userId);

    return {
      success: true,
      message: "User updated successfully",
      user: sanitizeUser(updatedUser),
    };
  },
});

export const deleteUserAdmin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.delete(args.userId);
    return { success: true, message: "User deleted successfully" };
  },
});

export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const videos = await ctx.db.query("videos").collect();

    const totalUsers = users.filter((u) => u.role === "user").length;
    const activeUsers = users.filter((u) => u.role === "user" && u.isActive).length;
    const verifiedUsers = users.filter((u) => u.role === "user" && u.isEmailVerified).length;
    const totalVideos = videos.filter((v) => v.status !== "archived").length;
    const publishedVideos = videos.filter((v) => v.status === "published").length;

    const latestVideos = videos
      .filter((v) => v.status !== "archived")
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((v) => ({
        _id: v._id,
        title: v.title,
        thumbnail: v.thumbnail,
        category: v.category,
        status: v.status,
        createdAt: v.createdAt,
        duration: v.duration,
      }));

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      totalVideos,
      publishedVideos,
      latestVideos,
    };
  },
});
