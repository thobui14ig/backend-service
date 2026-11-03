import { ForbiddenException } from '@nestjs/common';
import { LEVEL } from '../../../user/entities/user.entity';
import { LinkEntity, LinkType } from '../../entities/links.entity';
import {
  LinkMutationPort,
  LinkMutationTransactionPort,
} from '../link-mutation.port';
import { UpdateLinkUseCase } from './manage-link.use-cases';

describe('UpdateLinkUseCase', () => {
  const transaction: LinkMutationTransactionPort = {
    findForUpdate: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
  const links: LinkMutationPort = {
    transaction: jest.fn((work) => work(transaction)),
    getById: jest.fn(),
    markCommentsForRefetch: jest.fn(),
    deleteMany: jest.fn(),
    findByPostId: jest.fn(),
    savePublicLink: jest.fn(),
    countByUser: jest.fn(),
    countByUserAfterStatusChange: jest.fn(),
    deleteByPage: jest.fn(),
    deleteByTiktok: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('prevents a non-owner from changing a link', async () => {
    (transaction.findForUpdate as jest.Mock).mockResolvedValue({
      id: 8,
      userId: 3,
    });

    await expect(
      new UpdateLinkUseCase(links).execute(
        { id: 8, linkName: 'updated', groupId: 2 },
        LEVEL.USER,
        7,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(transaction.save).not.toHaveBeenCalled();
  });

  it('only lets administrators change protected link fields', async () => {
    const link = {
      id: 8,
      userId: 7,
      linkName: 'old',
      groupId: 1,
      delayTime: 5,
      type: LinkType.PUBLIC,
    } as LinkEntity;
    (transaction.findForUpdate as jest.Mock).mockResolvedValue(link);
    (transaction.save as jest.Mock).mockImplementation((value) => value);

    await new UpdateLinkUseCase(links).execute(
      {
        id: 8,
        linkName: 'new',
        groupId: 2,
        delayTime: 99,
        type: LinkType.PRIVATE,
      },
      LEVEL.USER,
      7,
    );

    expect(link).toMatchObject({
      linkName: 'new',
      groupId: 2,
      delayTime: 5,
      type: LinkType.PUBLIC,
    });
  });
});
