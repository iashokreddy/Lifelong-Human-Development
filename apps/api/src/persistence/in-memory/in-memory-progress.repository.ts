import { Injectable } from '@nestjs/common';
import type { ProgressRecord } from '../../shared/contract';
import type { ProgressRepository } from '../repositories';

/** In-memory ProgressRepository keyed by "userId|phaseId|itemKey". */
@Injectable()
export class InMemoryProgressRepository implements ProgressRepository {
  private readonly records = new Map<string, ProgressRecord>();

  private key(userId: string, phaseId: string, itemKey: string): string {
    return `${userId}|${phaseId}|${itemKey}`;
  }

  async upsert(record: ProgressRecord): Promise<ProgressRecord> {
    this.records.set(this.key(record.userId, record.phaseId, record.itemKey), { ...record });
    return { ...record };
  }

  async findForUser(userId: string): Promise<ProgressRecord[]> {
    return [...this.records.values()]
      .filter((r) => r.userId === userId)
      .map((r) => ({ ...r }));
  }

  async findOne(
    userId: string,
    phaseId: string,
    itemKey: string,
  ): Promise<ProgressRecord | null> {
    const found = this.records.get(this.key(userId, phaseId, itemKey));
    return found ? { ...found } : null;
  }

  async deleteForUser(userId: string): Promise<number> {
    let removed = 0;
    for (const [key, record] of this.records.entries()) {
      if (record.userId === userId) {
        this.records.delete(key);
        removed += 1;
      }
    }
    return removed;
  }
}
