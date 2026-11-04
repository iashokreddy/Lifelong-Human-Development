import { Injectable } from '@nestjs/common';
import type { CaregiverLink, CaregiverLinkRepository } from '../repositories';
import { PrismaService } from './prisma.service';

/** Prisma/Postgres CaregiverLinkRepository. Selected only when DATABASE_URL is set. */
@Injectable()
export class PrismaCaregiverLinkRepository implements CaregiverLinkRepository {
  constructor(private readonly prisma: PrismaService) {}

  private compound(caregiverId: string, learnerId: string) {
    return { caregiverId_learnerId: { caregiverId, learnerId } };
  }

  async link(link: CaregiverLink): Promise<CaregiverLink> {
    await this.prisma.db.caregiverLink.upsert({
      where: this.compound(link.caregiverId, link.learnerId),
      create: link,
      update: {},
    });
    return link;
  }

  async unlink(caregiverId: string, learnerId: string): Promise<boolean> {
    await this.prisma.db.caregiverLink.delete({
      where: this.compound(caregiverId, learnerId),
    });
    return true;
  }

  async exists(caregiverId: string, learnerId: string): Promise<boolean> {
    const found = await this.prisma.db.caregiverLink.findUnique({
      where: this.compound(caregiverId, learnerId),
    });
    return found !== null;
  }

  async listForCaregiver(caregiverId: string): Promise<CaregiverLink[]> {
    return (await this.prisma.db.caregiverLink.findMany({
      where: { caregiverId },
    })) as CaregiverLink[];
  }

  async listForLearner(learnerId: string): Promise<CaregiverLink[]> {
    return (await this.prisma.db.caregiverLink.findMany({
      where: { learnerId },
    })) as CaregiverLink[];
  }
}
