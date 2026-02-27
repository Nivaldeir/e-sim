import { Client } from "minio";
import { Readable } from "stream";

const RAW_MINIO_URL = process.env.MINIO_URL;

let MINIO_ENDPOINT: string;
let MINIO_PORT: number;
let MINIO_USE_SSL: boolean;

if (RAW_MINIO_URL) {
  const url = new URL(RAW_MINIO_URL);
  MINIO_ENDPOINT = url.hostname;
  MINIO_PORT = url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80;
  MINIO_USE_SSL = url.protocol === "https:";
} else {
  MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "minio";
  MINIO_PORT = Number(process.env.MINIO_PORT || "9000");
  MINIO_USE_SSL = (process.env.MINIO_USE_SSL || "false").toLowerCase() === "true";
}

const MINIO_ACCESS_KEY =
  process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || "minio";
const MINIO_SECRET_KEY =
  process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || "minio12345";

const PUBLIC_MINIO_URL =
  process.env.MINIO_PUBLIC_URL ||
  RAW_MINIO_URL ||
  `http://localhost:${MINIO_PORT}`;

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

export function parseMinioUrl(url: string): { bucket: string; objectName: string } | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.replace(/^\/+/, "").split("/");
    if (parts.length < 2) return null;
    const bucket = parts[0];
    const objectName = parts.slice(1).join("/");
    return { bucket, objectName };
  } catch {
    return null;
  }
}

export async function getObjectFromMinio(
  bucket: string,
  objectName: string
): Promise<ReadableStream> {
  const stream = await minioClient.getObject(bucket, objectName);
  return Readable.toWeb(stream as NodeJS.Readable) as ReadableStream;
}

