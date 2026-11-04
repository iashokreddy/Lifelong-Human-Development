import { Injectable } from '@nestjs/common';
import type { ProgressRecord } from '../../shared/contract';
import type { ProgressRepository } from '../repositories';
import { PrismaService } from './prisma.service';

/** Prisma/Postgres ProgressRepository. Selected only when DATABASE_URL is set. */
@Injectable()
export class PrismaProgressRepository implements ProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  private compound(userId: string, phaseId: string, itemKey: string) {
    return { userId_phaseId_itemKey: { userId, phaseId, itemKey } };
  }

  async upsert(record: ProgressRecord): Promise<ProgressRecord> {
    await this.prisma.db.progressRecord.upsert({
      where: this.compound(record.userId, record.phaseId, record.itemKey),
      create: record,
      update: { status: record.status, updatedAt: record.updatedAt },
    });
    return record;
  }

  async findForUser(userId: string): Promise<ProgressRecord[]> {
    return (await this.prisma.db.progressRecord.findMany({
      where: { userId },
    })) as ProgressRecord[];
  }

  async findOne(
    userId: string,
    phaseId: string,
    itemKey: string,
  ): Promise<ProgressRecord | null> {
    return (await this.prisma.db.progressRecord.findUnique({
      where: this.compound(userId, phaseId, itemKey),
    })) as ProgressRecord | null;
  }

  async deleteForUser(userId: string): Promise<number> {
    const result = await this.prisma.db.progressRecord.deleteMany({ where: { userId } });
    return result.count;
  }
}
