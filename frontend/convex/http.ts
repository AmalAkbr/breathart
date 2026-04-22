import { httpAction } from "./_generated/server";
import { httpRouter } from "convex/server";

// ---------------------------------------------------------------------------
// Helpers & Security
// ---------------------------------------------------------------------------

function getCorsOrigin(request: Request): string {
  if (!process.env.ALLOWED_ORIGINS) {
    console.warn("⚠️ ALLOWED_ORIGINS environment variable is missing! CORS might block all external requests.");
  }

  const rawAllowed = process.env.ALLOWED_ORIGINS || "";
  const allowedOrigins = rawAllowed.split(",").map(d => d.trim()).filter(Boolean);
  
  // Default to the first allowed origin safely if request has no origin
  const fallbackOrigin = allowedOrigins.length > 0 ? allowedOrigins[0] : "https://breathartinstitute.in";

  const origin = request.headers.get("origin") || request.headers.get("Origin");
  if (!origin) return fallbackOrigin;
  
  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  console.warn(`[CORS] Blocked unrecognized origin: ${origin}`);
  return fallbackOrigin;
}

function corsHeaders(origin: string, extra: Record<string, string> = {}): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    ...extra,
  };
}

function jsonResponse(body: unknown, status = 200, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

// ---------------------------------------------------------------------------
// AWS Sig V4 helper (used for R2 PUT & DELETE)
// ---------------------------------------------------------------------------

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key instanceof Uint8Array ? key.buffer : key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

async function sha256Hex(data: ArrayBuffer | string): Promise<string> {
  const buf = typeof data === "string" ? new TextEncoder().encode(data).buffer : data;
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function buildR2AuthHeader(
  method: string,
  bucket: string,
  key: string,
  accountId: string,
  accessKey: string,
  secretKey: string,
  contentType: string,
  bodyHash: string,
  now: Date
): Promise<{ authorization: string; amzDate: string }> {
  const region = "auto";
  const service = "s3";
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders =
    (contentType ? `content-type:${contentType}\n` : "") +
    `host:${host}\n` +
    `x-amz-content-sha256:${bodyHash}\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders = contentType
    ? "content-type;host;x-amz-content-sha256;x-amz-date"
    : "host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    method,
    `/${bucket}/${key}`,
    "", // no query string
    canonicalHeaders,
    signedHeaders,
    bodyHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const crHash = await sha256Hex(canonicalRequest);
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${crHash}`;

  const signingKey = await hmac(
    await hmac(
      await hmac(
        await hmac(new TextEncoder().encode(`AWS4${secretKey}`), dateStamp),
        region
      ),
      service
    ),
    "aws4_request"
  );
  const sigBuffer = await hmac(signingKey, stringToSign);
  const signature = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    authorization:
      `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`,
    amzDate,
  };
}

// ---------------------------------------------------------------------------
// Upload thumbnail → ImageKit
// ---------------------------------------------------------------------------

const uploadThumbnail = httpAction(async (_ctx, request) => {
  const origin = getCorsOrigin(request);
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  console.log(`[Upload] Received thumbnail upload request from origin: ${origin || "unknown"}`);

  if (origin === "https://breathartinstitute.in" && !request.headers.get("origin")?.includes("breathartinstitute.in")) {
    console.error(`[Upload] Blocked thumbnail upload - CORS mismatch.`);
    return jsonResponse({ success: false, error: "Unauthorized endpoint access (CORS)" }, 403, origin);
  }

  try {
    const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY ?? "";
    const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT ?? "";

    if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
      return jsonResponse({ success: false, error: "ImageKit not configured" }, 500, origin);
    }

    const formData = await request.formData();
    const file = formData.get("thumbnail") as File | null;

    if (!file) {
      return jsonResponse({ success: false, error: "No thumbnail file provided" }, 400, origin);
    }

    // Validate mime
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(file.type)) {
      return jsonResponse({ success: false, error: "Thumbnail must be JPEG, PNG, or WebP" }, 400, origin);
    }

    // Max 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return jsonResponse({ success: false, error: "Thumbnail exceeds 10 MB limit" }, 400, origin);
    }

    // Build multipart body for ImageKit upload API
    const ikForm = new FormData();
    ikForm.append("file", file);
    ikForm.append(
      "fileName",
      `thumb_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    );
    ikForm.append("folder", "/breathart/thumbnails");
    ikForm.append("useUniqueFileName", "true");

    const authHeader = "Basic " + btoa(`${IMAGEKIT_PRIVATE_KEY}:`);

    const ikRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: { Authorization: authHeader },
      body: ikForm,
    });

    if (!ikRes.ok) {
      const errText = await ikRes.text();
      console.error("ImageKit upload failed:", errText);
      return jsonResponse({ success: false, error: "Thumbnail upload failed" }, 502, origin);
    }

    const ikData = (await ikRes.json()) as { url: string; fileId: string; name: string };

    return jsonResponse({
      success: true,
      data: {
        thumbnailUrl: ikData.url,
        fileId: ikData.fileId,
        fileName: ikData.name,
      },
    }, 200, origin);
  } catch (err) {
    console.error("uploadThumbnail error:", err);
    return jsonResponse({ success: false, error: "Internal server error" }, 500, origin);
  }
});

// ---------------------------------------------------------------------------
// Upload video → Cloudflare R2  (max 500 MB, AWS Sig V4)
// ---------------------------------------------------------------------------

const uploadVideoFile = httpAction(async (_ctx, request) => {
  const origin = getCorsOrigin(request);
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  console.log(`[Upload] Received video upload request from origin: ${origin || "unknown"}`);

  if (origin === "https://breathartinstitute.in" && !request.headers.get("origin")?.includes("breathartinstitute.in")) {
    console.error(`[Upload] Blocked video upload - CORS mismatch.`);
    return jsonResponse({ success: false, error: "Unauthorized endpoint access (CORS)" }, 403, origin);
  }

  try {
    const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID ?? "";
    const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "";
    const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "";
    const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET ?? "";
    const R2_PUBLIC_URL = (process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "").replace(/\/$/, "");

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_BUCKET) {
      return jsonResponse({ success: false, error: "Cloudflare R2 not configured" }, 500, origin);
    }

    const formData = await request.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return jsonResponse({ success: false, error: "No video file provided" }, 400, origin);
    }

    // Validate mime type
    const allowedMimes = ["video/mp4", "video/webm", "video/x-msvideo", "video/quicktime"];
    if (!allowedMimes.includes(file.type)) {
      return jsonResponse(
        { success: false, error: "Invalid video format. Use MP4, WebM, AVI, or MOV." },
        400, origin
      );
    }

    // Enforce 500 MB limit server-side
    const MAX_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return jsonResponse({ success: false, error: "Video exceeds 500 MB limit" }, 400, origin);
    }

    const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
    const key = `breathart/videos/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const fileBuffer = await file.arrayBuffer();
    const payloadHash = await sha256Hex(fileBuffer);

    const { authorization, amzDate } = await buildR2AuthHeader(
      "PUT",
      R2_BUCKET,
      key,
      R2_ACCOUNT_ID,
      R2_ACCESS_KEY,
      R2_SECRET_KEY,
      file.type,
      payloadHash,
      new Date()
    );

    const uploadUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`;

    const r2Res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: authorization,
        "Content-Type": file.type,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
      },
      body: fileBuffer,
    });

    console.log(`[Upload] R2 PUT response status: ${r2Res.status}`);

    if (!r2Res.ok) {
      const errText = await r2Res.text();
      console.error("R2 upload failed:", r2Res.status, errText);
      return jsonResponse({ success: false, error: "Video upload to storage failed" }, 502, origin);
    }

    const videoUrl = `${R2_PUBLIC_URL}/${key}`;
    console.log(`✅ Video uploaded to R2: ${key} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);

    return jsonResponse({
      success: true,
      data: { videoUrl, videoKey: key },
    }, 200, origin);
  } catch (err) {
    console.error("uploadVideoFile error:", err);
    return jsonResponse({ success: false, error: "Internal server error" }, 500, origin);
  }
});

// ---------------------------------------------------------------------------
// Cancel upload — deletes already-uploaded files from ImageKit / R2
//
// Body (JSON): { thumbnailFileId?: string, videoKey?: string }
//
// Called when user cancels mid-upload. The XHR is aborted client-side (so
// a mid-flight video PUT never completes and R2 discards it automatically).
// If the thumbnail was already uploaded, we delete it here via ImageKit API.
// If a video was fully uploaded but the DB save was cancelled, the videoKey
// can also be cleaned up here before the hourly orphan-cleanup cron catches it.
// ---------------------------------------------------------------------------

const cancelUpload = httpAction(async (_ctx, request) => {
  const origin = getCorsOrigin(request);
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  console.log(`[Cleanup] Received explicit cancellation request...`);

  try {
    let body: { thumbnailFileId?: string; videoKey?: string } = {};
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ success: false, error: "Invalid JSON body" }, 400, origin);
    }

    const { thumbnailFileId, videoKey } = body;
    const results: Record<string, string> = {};

    // --- Delete ImageKit thumbnail ---
    if (thumbnailFileId) {
      try {
        const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY ?? "";
        if (IMAGEKIT_PRIVATE_KEY) {
          const authHeader = "Basic " + btoa(`${IMAGEKIT_PRIVATE_KEY}:`);
          const delRes = await fetch(
            `https://api.imagekit.io/v1/files/${encodeURIComponent(thumbnailFileId)}`,
            { method: "DELETE", headers: { Authorization: authHeader } }
          );
          if (delRes.ok || delRes.status === 404) {
            results.thumbnail = "deleted";
            console.log(`🗑️ [Cancel] ImageKit thumbnail deleted: ${thumbnailFileId}`);
          } else {
            results.thumbnail = `failed (${delRes.status})`;
            console.warn(`⚠️ [Cancel] ImageKit delete failed: ${delRes.status}`);
          }
        } else {
          results.thumbnail = "skipped (not configured)";
        }
      } catch (err: any) {
        results.thumbnail = `error: ${err.message}`;
        console.error(`❌ [Cancel] ImageKit delete error:`, err);
      }
    }

    // --- Delete R2 video if key provided (fully uploaded but DB save cancelled) ---
    if (videoKey) {
      try {
        const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID ?? "";
        const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "";
        const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "";
        const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET ?? "";

        if (R2_ACCOUNT_ID && R2_ACCESS_KEY && R2_SECRET_KEY && R2_BUCKET) {
          const emptyHash = await sha256Hex("");
          const { authorization, amzDate } = await buildR2AuthHeader(
            "DELETE",
            R2_BUCKET,
            videoKey,
            R2_ACCOUNT_ID,
            R2_ACCESS_KEY,
            R2_SECRET_KEY,
            "",
            emptyHash,
            new Date()
          );

          const delUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${videoKey}`;
          const delRes = await fetch(delUrl, {
            method: "DELETE",
            headers: {
              Authorization: authorization,
              "x-amz-content-sha256": emptyHash,
              "x-amz-date": amzDate,
            },
          });

          if (delRes.ok || delRes.status === 204 || delRes.status === 404) {
            results.video = "deleted";
            console.log(`🗑️ [Cancel] R2 video deleted: ${videoKey}`);
          } else {
            results.video = `failed (${delRes.status})`;
            console.warn(`⚠️ [Cancel] R2 delete failed: ${delRes.status}`);
          }
        } else {
          results.video = "skipped (not configured)";
        }
      } catch (err: any) {
        results.video = `error: ${err.message}`;
        console.error(`❌ [Cancel] R2 delete error:`, err);
      }
    }

    return jsonResponse({ success: true, results }, 200, origin);
  } catch (err) {
    console.error("cancelUpload error:", err);
    return jsonResponse({ success: false, error: "Internal server error" }, 500, origin);
  }
});

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const http = httpRouter();

http.route({ path: "/upload/thumbnail", method: "POST", handler: uploadThumbnail });
http.route({ path: "/upload/thumbnail", method: "OPTIONS", handler: uploadThumbnail });

http.route({ path: "/upload/video-file", method: "POST", handler: uploadVideoFile });
http.route({ path: "/upload/video-file", method: "OPTIONS", handler: uploadVideoFile });

http.route({ path: "/upload/cancel", method: "POST", handler: cancelUpload });
http.route({ path: "/upload/cancel", method: "OPTIONS", handler: cancelUpload });

export default http;
