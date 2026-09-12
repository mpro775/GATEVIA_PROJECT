import type { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { MediaService } from '../src/media/media.service';

function serviceWith(total = 5) {
  const findManyCalls: Prisma.MediaFindManyArgs[] = [];
  const countCalls: Prisma.MediaCountArgs[] = [];
  const findMany = vi.fn((args: Prisma.MediaFindManyArgs) => { findManyCalls.push(args); return Promise.resolve([]); });
  const count = vi.fn((args: Prisma.MediaCountArgs) => { countCalls.push(args); return Promise.resolve(total); });
  const prisma = { media: { findMany, count }, $transaction: vi.fn((items: Array<Promise<unknown>>) => Promise.all(items)) };
  const config = { getOrThrow: vi.fn((key: string) => key), get: vi.fn(() => undefined) };
  const service = new MediaService(config as never, prisma as never, { media: { add: vi.fn() } } as never, {} as never);
  return { service, findManyCalls, countCalls };
}

describe('MediaService.list', () => {
  it('applies MIME filtering before count and pagination', async () => {
    const { service, findManyCalls, countCalls } = serviceWith(5);
    const result = await service.list(2, 2, 'hero', 'ready', 'folder-1', 'image/');
    expect(findManyCalls[0]?.where).toMatchObject({
      status: 'ready', folderId: 'folder-1', mimeType: { startsWith: 'image/' },
    });
    expect(findManyCalls[0]?.where?.OR).toHaveLength(2);
    expect(findManyCalls[0]?.skip).toBe(2);
    expect(findManyCalls[0]?.take).toBe(2);
    expect(countCalls[0]?.where).toEqual(findManyCalls[0]?.where);
    expect(result.meta).toEqual({ page: 2, pageSize: 2, total: 5, pageCount: 3 });
  });

  it('preserves unfiltered pagination', async () => {
    const { service, findManyCalls } = serviceWith(40);
    const result = await service.list(1, 20);
    expect(findManyCalls[0]).toMatchObject({ skip: 0, take: 20 });
    expect(result.meta.pageCount).toBe(2);
  });
});
