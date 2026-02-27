import { Client } from "minio";

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "minio";
const MINIO_PORT = Number(process.env.MINIO_PORT || "9000");
const MINIO_USE_SSL = (process.env.MINIO_USE_SSL || "false").toLowerCase() === "true";

const MINIO_ACCESS_KEY =
  process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || "minio";
const MINIO_SECRET_KEY =
  process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || "minio12345";

const PUBLIC_MINIO_URL =
  process.env.MINIO_PUBLIC_URL || `http://localhost:${MINIO_PORT}`;

const minioClient = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

const ensuredBuckets = new Set<string>();

async function ensureBucket(bucket: string) {
  if (ensuredBuckets.has(bucket)) return;

  const exists = await minioClient.bucketExists(bucket).catch(() => false);

  if (!exists) {
    await minioClient.makeBucket(bucket, "");
  }

  ensuredBuckets.add(bucket);
}

export interface MinioUploadParams {
  bucket: string;
  fileName: string;
  buffer: Buffer;
  contentType?: string;
  prefix?: string;
}

export interface MinioUploadResult {
  bucket: string;
  objectName: string;
  url: string;
}

export async function uploadToMinio({
  bucket,
  fileName,
  buffer,
  contentType,
  prefix,
}: MinioUploadParams): Promise<MinioUploadResult> {
  await ensureBucket(bucket);

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const ext = fileName.split(".").pop() || "";
  const baseName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

  const objectNameBase = `${timestamp}-${randomStr}-${baseName}`;
  const objectName = prefix
    ? `${prefix.replace(/\/+$/, "")}/${objectNameBase}`
    : objectNameBase;

  await minioClient.putObject(bucket, objectName, buffer, buffer.length, {
    "Content-Type": contentType || "application/octet-stream",
  });

  const baseUrl = PUBLIC_MINIO_URL.replace(/\/$/, "");
  const url = `${baseUrl}/${bucket}/${objectName}`;

  return {
    bucket,
    objectName,
    url,
  };
}

