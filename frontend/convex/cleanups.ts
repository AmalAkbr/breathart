"use node";

import { internalAction } from "./_generated/server";
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import ImageKit from "@imagekit/nodejs";
import { internal } from "./_generated/api";

const normalizeKey = (key: string = "") => String(key).replace(/^\/+/, "").trim();

const isLikelyVideoObject = (key: string = "") => {
  const normalized = normalizeKey(key).toLowerCase();
  if (!normalized) return false;
  if (normalized.startsWith("videos/") || normalized.startsWith("breathart/videos/")) return true;
  const videoExtensions = new Set(["mp4", "webm", "avi", "mov", "mkv", "m4v"]);
  const ext = normalized.split(".").pop();
  return videoExtensions.has(ext || "");
};

export const runOrphanCleanup = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log(`\n🧼 [Orphan Cleanup] Started at ${new Date().toISOString()}`);

    const dbKeys = await ctx.runQuery(internal.videos.getDbVideoKeys, {});
    const r2DbKeysSet = new Set(dbKeys.r2VideoKeys);
    const imagekitDbFileIdSet = new Set(dbKeys.imagekitFileIds);
    // Extract file names from imagekit URLs since listFiles returns names
    const imagekitValidNamesSet = new Set(dbKeys.imagekitUrls.map(url => {
        try {
            const parsed = new URL(url);
            return decodeURIComponent(parsed.pathname.split("/").pop() || "");
        } catch {
            return decodeURIComponent(url.split("?")[0].split("/").pop() || "");
        }
    }).filter(n => n));

    let summary = {
        r2Orphans: 0,
        r2Deleted: 0,
        imagekitOrphans: 0,
        imagekitDeleted: 0,
    };

    // 1. R2 Cleanup
    if (process.env.CLOUDFLARE_R2_BUCKET && process.env.CLOUDFLARE_R2_ACCOUNT_ID) {
        try {
            const r2Client = new S3Client({
                region: "auto",
                credentials: {
                  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
                  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
                },
                endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            });
            const r2Bucket = process.env.CLOUDFLARE_R2_BUCKET;

            let continuationToken: string | undefined;
            const allR2Keys: string[] = [];

            // Pagination over R2 Objects
            do {
                const response = await r2Client.send(
                    new ListObjectsV2Command({
                        Bucket: r2Bucket,
                        ContinuationToken: continuationToken,
                    })
                );

                for (const object of response.Contents || []) {
                    const key = normalizeKey(object.Key || "");
                    if (key && isLikelyVideoObject(key)) {
                        allR2Keys.push(key);
                    }
                }

                continuationToken = response.NextContinuationToken;
            } while (continuationToken);

            const r2OrphanKeys = allR2Keys.filter(key => !r2DbKeysSet.has(key));
            summary.r2Orphans = r2OrphanKeys.length;

            for (const key of r2OrphanKeys) {
                try {
                    await r2Client.send(new DeleteObjectCommand({
                        Bucket: r2Bucket,
                        Key: key
                    }));
                    summary.r2Deleted++;
                    console.log(`🗑️ [R2] Deleted orphan: ${key}`);
                } catch(err) {
                    console.warn(`⚠️ [R2] Failed to delete: ${key}`);
                }
            }
        } catch(e: any) {
            console.error(`❌ [R2 Cleanup] Error: ${e.message}`);
        }
    } else {
        console.log("⏭️ [R2 Cleanup] Skipped: Not configured");
    }

    // 2. ImageKit Cleanup
    if (process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
        try {
            const authHeader = "Basic " + btoa(process.env.IMAGEKIT_PRIVATE_KEY + ":");
            
            // Iterate standard subdirectories/tags if applicable (fallback to root if needed)
            const response = await fetch("https://api.imagekit.io/v1/files?path=/breathart/thumbnails&limit=1000", {
                headers: { Authorization: authHeader }
            });

            if (!response.ok) {
                console.error(`❌ [ImageKit Cleanup] API fetch error: ${response.status}`);
            } else {
                const allImageKitFiles = (await response.json()) || [];
                
                const imageKitOrphans = allImageKitFiles.filter((item: any) => {
                    // If it resolves by file ID in DB, not orphan
                    if (imagekitDbFileIdSet.has(item.fileId)) return false;
                    // If it resolves by URL/name, not orphan
                    if (imagekitValidNamesSet.has(item.name)) return false;
                    return true;
                });

                summary.imagekitOrphans = imageKitOrphans.length;

                for (const file of imageKitOrphans) {
                    try {
                        const delRes = await fetch(`https://api.imagekit.io/v1/files/${file.fileId}`, {
                            method: "DELETE",
                            headers: { Authorization: authHeader }
                        });
                        if (delRes.ok) {
                            summary.imagekitDeleted++;
                            console.log(`🗑️ [ImageKit] Deleted orphan: ${file.name}`);
                        } else {
                            console.warn(`⚠️ [ImageKit] Failed to delete: ${file.name} (Code: ${delRes.status})`);
                        }
                    } catch(err) {
                        console.warn(`⚠️ [ImageKit] Network err on delete: ${file.name}`);
                    }
                }
            }
        } catch(e: any) {
             console.error(`❌ [ImageKit Cleanup] Error: ${e.message}`);
        }
    } else {
         console.log("⏭️ [ImageKit Cleanup] Skipped: Not configured");
    }

    console.log(`✅ [Orphan Cleanup] Done. Summary:`, summary);
    return summary;
  }
});
