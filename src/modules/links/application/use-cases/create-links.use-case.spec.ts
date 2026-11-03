import { HttpException } from '@nestjs/common';
import { EPlatform, LinkStatus } from '../../entities/links.entity';
import { LinkCreationPort } from '../link-creation.port';
import { CreateLinksUseCase } from './create-links.use-case';
import { GetUserByIdUseCase } from '../../../user/application/use-cases/manage-users.use-cases';
import { GetUserLinkCountUseCase } from './manage-link.use-cases';

describe('CreateLinksUseCase', () => {
  it('rejects users without a plan before creating links', async () => {
    const port: LinkCreationPort = {
      findExistingUrls: jest.fn(),
      saveMany: jest.fn(),
    };
    const getUserById = {
      execute: jest.fn().mockResolvedValue({ planId: null }),
    } as unknown as GetUserByIdUseCase;
    const getUserLinkCount = {
      execute: jest.fn(),
    } as unknown as GetUserLinkCountUseCase;

    await expect(
      new CreateLinksUseCase(port, getUserById, getUserLinkCount).execute({
        links: [{ url: 'https://example.com', name: 'link' }],
        groupId: 0,
        status: LinkStatus.Pending,
        platform: EPlatform.FACEBOOK,
        userId: 7,
      }),
    ).rejects.toBeInstanceOf(HttpException);

    expect(getUserLinkCount.execute).not.toHaveBeenCalled();
    expect(port.findExistingUrls).not.toHaveBeenCalled();
  });

  it('rejects a request that exceeds the purchased link quota', async () => {
    const port: LinkCreationPort = {
      findExistingUrls: jest.fn(),
      saveMany: jest.fn(),
    };
    const getUserById = {
      execute: jest.fn().mockResolvedValue({ planId: 1, totalLink: 2 }),
    } as unknown as GetUserByIdUseCase;
    const getUserLinkCount = {
      execute: jest.fn().mockResolvedValue(1),
    } as unknown as GetUserLinkCountUseCase;

    await expect(
      new CreateLinksUseCase(port, getUserById, getUserLinkCount).execute({
        links: [
          { url: 'https://example.com/1', name: 'one' },
          { url: 'https://example.com/2', name: 'two' },
        ],
        groupId: 0,
        status: LinkStatus.Pending,
        platform: EPlatform.FACEBOOK,
        userId: 7,
      }),
    ).rejects.toBeInstanceOf(HttpException);

    expect(port.findExistingUrls).not.toHaveBeenCalled();
    expect(port.saveMany).not.toHaveBeenCalled();
  });

  it('deduplicates input, skips existing links, applies TikTok defaults, and batches writes', async () => {
    const port: LinkCreationPort = {
      findExistingUrls: jest.fn().mockResolvedValue(['already-exists']),
      saveMany: jest.fn().mockResolvedValue(undefined),
    };
    const getUserById = {
      execute: jest.fn().mockResolvedValue({ planId: 1, totalLink: 100 }),
    } as unknown as GetUserByIdUseCase;
    const getUserLinkCount = {
      execute: jest.fn().mockResolvedValue(0),
    } as unknown as GetUserLinkCountUseCase;
    const useCase = new CreateLinksUseCase(
      port,
      getUserById,
      getUserLinkCount,
    );
    const links = Array.from({ length: 11 }, (_, index) => ({
      url: `https://tiktok.com/video/${index + 1}`,
      name: `video-${index + 1}`,
    }));
    links.push(links[0], { url: 'already-exists', name: 'duplicate' });

    await expect(
      useCase.execute({
        links,
        groupId: 0,
        status: LinkStatus.Pending,
        platform: EPlatform.TIKTOK,
        userId: 104,
      }),
    ).rejects.toBeInstanceOf(HttpException);

    expect(port.findExistingUrls).toHaveBeenCalledWith(
      104,
      expect.arrayContaining(['already-exists']),
    );
    expect(port.saveMany).toHaveBeenCalledTimes(2);
    expect(port.saveMany).toHaveBeenNthCalledWith(
      1,
      expect.arrayContaining([
        expect.objectContaining({
          postId: '1',
          delayTime: 2,
          process: true,
        }),
      ]),
    );
  });
});
