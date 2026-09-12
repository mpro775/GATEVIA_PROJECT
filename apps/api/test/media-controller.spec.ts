import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { MediaController } from '../src/media/media.controller';

describe('MediaController.list', () => {
  it('rejects an invalid MIME prefix', async () => {
    const list = vi.fn();
    const controller = new MediaController({ list } as never, {} as never);
    await expect(controller.list('1', '24', undefined, 'ready', undefined, 'image')).rejects.toBeInstanceOf(BadRequestException);
    expect(list).not.toHaveBeenCalled();
  });

  it('passes a valid MIME prefix to the service', async () => {
    const list = vi.fn().mockResolvedValue({ data: [], meta: {} });
    const controller = new MediaController({ list } as never, {} as never);
    await controller.list('1', '24', 'hero', 'ready', 'folder-1', 'image/');
    expect(list).toHaveBeenCalledWith(1, 24, 'hero', 'ready', 'folder-1', 'image/');
  });
});
