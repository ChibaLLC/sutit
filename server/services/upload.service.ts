import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { extname, join } from "path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { H3Event, MultiPartData } from "h3";

interface UploadOptions {
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
}

const clientCred = {
  endpoint: process.env.MINIO_ENDPOINT!,
  region: process.env.MINIO_REGION!,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
  s3ForcePathStyle: true,
};
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "uploads";
const UPLOAD_DIR = process.env.UPLOAD_DIR!;
const STORAGE_TYPE = process.env.STORAGE_TYPE!;

const minioClient = new S3Client({
  endpoint: clientCred.endpoint,
  region: clientCred.region,
  credentials: {
    accessKeyId: clientCred.credentials.accessKeyId,
    secretAccessKey: clientCred.credentials.secretAccessKey,
  },
  forcePathStyle: true,
});

export const handleFileUpload = async (event: H3Event, options?: UploadOptions) => {
  const {
    multiple = true,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = [],
  } = options;
  try {
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length == 0) {
      return;
    }
    const file = formData.find((item) => item.filename);
    if (!file) {
      return;
    }
    const files = formData.filter((item) => item.filename);

    if (files.length === 0) {
      throw new Error("No files found in form data");
    }

    // Check file count limit
    if (files.length > maxFiles) {
      throw new Error(`Too many files. Maximum allowed: ${maxFiles}`);
    }

    // If single file mode, only take the first file
    const filesToProcess = multiple ? files : [files[0]];

    // Validate files
    for (const file of filesToProcess) {
      // Check file size
      if (file.data.length > maxSize) {
        throw new Error(
          `File "${file.filename}" is too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
        );
      }

      // Check file type if restrictions are set
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        throw new Error(
          `File "${file.filename}" has invalid type. Allowed types: ${allowedTypes.join(", ")}`,
        );
      }
      // Upload all files
      const uploadPromises = filesToProcess.map((file) => handleSingleFileUpload(file));
      const uploadResults = await Promise.all(uploadPromises);

      // Return single object for single file mode, array for multiple
      return uploadResults;
    }
  } catch (e: any) {}
};

export const handleSingleFileUpload = async (file: MultiPartData) => {
  const fileExtension = extname(file.filename || "");
  const uniqueName = `${randomUUID()}${fileExtension}`;

  if (STORAGE_TYPE == "minio") {
    const key = `uploads/${uniqueName}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.data,
      ContentType: file.type || "application/octet-stream",
    });

    await minioClient.send(command);

    const url = `${clientCred.endpoint}/${BUCKET_NAME}/${key}`;
    return {
      originalName: file.filename,
      fileName: uniqueName,
      path: url,
      size: file.data.length,
      type: file.type || "application/octet-stream",
    };
  } else {
    // Save to local volume
    const uploadPath = join(process.cwd(), UPLOAD_DIR);

    // Ensure upload directory exists
    await mkdir(uploadPath, { recursive: true });

    const filePath = join(uploadPath, uniqueName);

    // Write file to disk
    await writeFile(filePath, file.data);

    return {
      originalName: file.filename,
      filename: uniqueName,
      path: `/uploads/${uniqueName}`,
      size: file.data.length,
      type: file.type || "application/octet-stream",
    };
  }
};
