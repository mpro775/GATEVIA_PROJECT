import type { Media, UploadSession } from '@gatevia/api-client';
import { api } from './api';

export type UploadPhase = 'queued' | 'uploading' | 'finalizing' | 'done' | 'error';

export type UploadProgressItem = {
  id: string;
  name: string;
  size: number;
  loaded: number;
  percent: number;
  phase: UploadPhase;
};

export function putFileWithProgress(
  session: UploadSession,
  file: File,
  onProgress?: (loaded: number, total: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', session.url, true);
    for (const [key, value] of Object.entries(session.headers)) xhr.setRequestHeader(key, value);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded, event.total);
      else onProgress?.(event.loaded, file.size);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.onabort = () => reject(new Error('Upload aborted'));
    xhr.send(file);
  });
}

export async function uploadAdminMedia(
  file: File,
  folderId: string | null,
  onProgress?: (loaded: number, total: number, phase: UploadPhase) => void,
): Promise<Media> {
  const session = await api<UploadSession>('/admin/media/upload-session', {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      folderId: folderId || undefined,
    }),
  });
  await putFileWithProgress(session, file, (loaded, total) => onProgress?.(loaded, total, 'uploading'));
  onProgress?.(file.size, file.size, 'finalizing');
  const media = await api<Media>('/admin/media/finalize', {
    method: 'POST',
    body: JSON.stringify({ uploadToken: session.uploadToken, folderId: folderId || undefined }),
  });
  onProgress?.(file.size, file.size, 'done');
  return media;
}
