import { mutation, query, internalQuery, action } from "./_generated/server";
import { v } from "convex/values";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const normalizeKey = (key: string = "") => String(key).replace(/^\/+/, "").trim();

export const getDbVideoKeys = internalQuery({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("videos").collect();
    
    // R2 uses publicUrl checking to find keys
    const r2PublicUrl = process.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || "";
    const normalizedPrefix = r2PublicUrl.replace(/\/$/, "");

    const r2keySet = new Set<string>();
    const imagekitFileIdSet = new Set<string>();
    const imagekitUrlSet = new Set<string>();

    for (const record of records) {
      if (record.videoKey) {
        r2keySet.add(normalizeKey(record.videoKey));
      }
      if (record.videoUrl) {
        const url = record.videoUrl.trim();
        if (url.startsWith(normalizedPrefix)) {
            r2keySet.add(normalizeKey(url.substring(normalizedPrefix.length)));
        }
      }

      if (record.thumbnailFileId) {
          imagekitFileIdSet.add(record.thumbnailFileId);
      }
      if (record.thumbnail) {
          imagekitUrlSet.add(record.thumbnail.trim());
      }
    }

    return {
      r2VideoKeys: Array.from(r2keySet),
      imagekitFileIds: Array.from(imagekitFileIdSet), 
      imagekitUrls: Array.from(imagekitUrlSet)
    };
  },
});


export const getAllVideos = query({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").collect();

    return videos
      .filter((video) => video.status !== "archived")
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getVideoById = query({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error("Video not found");
    }
    return video;
  },
});

export const getVideosByCategory = query({
  args: {
    category: v.union(
      v.literal("course"),
      v.literal("tutorial"),
      v.literal("webinar"),
      v.literal("demo"),
      v.literal("lecture"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();

    return videos.filter((video) => video.status === "published");
  },
});

export const getVideosByAdmin = query({
  args: {
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_created_by", (q) => q.eq("createdBy", args.adminId))
      .collect();

    return videos.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const createVideo = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    thumbnail: v.string(),
    thumbnailFileId: v.optional(v.string()),
    thumbnailPath: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    videoKey: v.optional(v.string()),
    duration: v.optional(v.number()),
    category: v.optional(
      v.union(
        v.literal("course"),
        v.literal("tutorial"),
        v.literal("webinar"),
        v.literal("demo"),
        v.literal("lecture"),
        v.literal("other")
      )
    ),
    createdBy: v.id("users"),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const videoId = await ctx.db.insert("videos", {
      title: args.title,
      description: args.description,
      thumbnail: args.thumbnail,
      thumbnailFileId: args.thumbnailFileId,
      thumbnailPath: args.thumbnailPath,
      videoUrl: args.videoUrl || "",
      videoKey: args.videoKey,
      duration: args.duration || 0,
      category: args.category || "course",
      createdBy: args.createdBy,
      status: "published",
      views: 0,
      likes: 0,
      tags: args.tags || [],
      isPublished: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, videoId };
  },
});

export const updateVideo = mutation({
  args: {
    videoId: v.id("videos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    thumbnailFileId: v.optional(v.string()),
    thumbnailPath: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    category: v.optional(
      v.union(
        v.literal("course"),
        v.literal("tutorial"),
        v.literal("webinar"),
        v.literal("demo"),
        v.literal("lecture"),
        v.literal("other")
      )
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { videoId, ...updates } = args;
    const video = await ctx.db.get(videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    await ctx.db.patch(videoId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteVideo = mutation({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    await ctx.db.delete(args.videoId);
    return { success: true, message: "Video deleted successfully" };
  },
});

export const publishVideo = mutation({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    await ctx.db.patch(args.videoId, {
      status: "published",
      isPublished: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const unpublishVideo = mutation({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    await ctx.db.patch(args.videoId, {
      status: "draft",
      isPublished: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const incrementViews = mutation({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    await ctx.db.patch(args.videoId, {
      views: (video.views || 0) + 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const generateVideoUploadUrl = action({
  args: {
    fileName: v.string(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const accountId = process.env.VITE_CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.VITE_CLOUDFLARE_R2_BUCKET;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error("Cloudflare R2 configuration missing.");
    }

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    const timestamp = Date.now();
    const sanitizeName = args.fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const videoKey = `breathart/videos/${timestamp}-${sanitizeName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: videoKey,
      ContentType: args.fileType,
    });

    // URL valid for 3 hours. 
    // We explicitly set checksumAlgorithm to undefined to prevent the SDK from adding 403-triggering checksums
    const uploadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 10800,
      signableHeaders: new Set(["host", "content-type"]), // Only sign essential headers to avoid mismatches
    });

    return { uploadUrl, videoKey };
  },
});
