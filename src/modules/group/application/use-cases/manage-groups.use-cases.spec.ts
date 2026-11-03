import { ForbiddenException } from '@nestjs/common';
import { GroupPort } from '../group.port';
import { UpdateGroupUseCase } from './manage-groups.use-cases';
import { LEVEL } from '../../../user/entities/user.entity';

describe('UpdateGroupUseCase', () => {
  const groups: GroupPort = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOwned: jest.fn().mockResolvedValue(false),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('rejects updates from users who do not own the group', async () => {
    const useCase = new UpdateGroupUseCase(groups);

    await expect(
      useCase.execute(5, { name: 'new name' }, 10, LEVEL.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(groups.update).not.toHaveBeenCalled();
  });

  it('allows administrators to update without an ownership lookup', async () => {
    const useCase = new UpdateGroupUseCase(groups);
    (groups.update as jest.Mock).mockResolvedValue({ id: 5 });

    await useCase.execute(5, { name: 'new name' }, 10, LEVEL.ADMIN);

    expect(groups.findOwned).not.toHaveBeenCalled();
    expect(groups.update).toHaveBeenCalledWith(5, { name: 'new name' });
  });
});
