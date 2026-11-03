import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VpsPort } from '../vps.port';
import { CreateVpsUseCase, RestartVpsUseCase } from './manage-vps.use-cases';
import { VpsType } from '../../entities/vps.entity';

describe('VPS use cases', () => {
  const vps: VpsPort = {
    exists: jest.fn().mockResolvedValue(false),
    saveMany: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    requestRestart: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('validates endpoints and stores parsed host/port values', async () => {
    const useCase = new CreateVpsUseCase(vps);

    await useCase.execute({
      vps: ['host.example:8080'],
      type: VpsType.Post,
    });

    expect(vps.saveMany).toHaveBeenCalledWith([
      { ip: 'host.example', port: 8080, type: VpsType.Post },
    ]);
  });

  it('rejects an invalid endpoint without writing it', async () => {
    const useCase = new CreateVpsUseCase(vps);

    await expect(
      useCase.execute({ vps: ['host:70000'], type: VpsType.Post }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(vps.saveMany).not.toHaveBeenCalled();
  });

  it('requires an existing VPS before sending restart', async () => {
    vps.findOne = jest.fn().mockResolvedValue(null);
    const useCase = new RestartVpsUseCase(vps);

    await expect(useCase.execute(9)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(vps.requestRestart).not.toHaveBeenCalled();
  });
});
