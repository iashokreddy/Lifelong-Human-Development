import { Injectable } from '@nestjs/common';
import type { NewUser, User, UserRepository } from '../repositories';
import { PrismaService } from './prisma.service';

/** Prisma/Postgres UserRepository. Selected only when DATABASE_URL is set. */
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: NewUser): Promise<User> {
    return (await this.prisma.db.user.create({ data: user })) as User;
  }

  async save(user: User): Promise<User> {
    const { id, ...data } = user;
    return (await this.prisma.db.user.update({ where: { id }, data })) as User;
  }

  async findById(id: string): Promise<User | null> {
    return (await this.prisma.db.user.findUnique({ where: { id } })) as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return (await this.prisma.db.user.findUnique({ where: { email } })) as User | null;
  }

  async list(): Promise<User[]> {
    return (await this.prisma.db.user.findMany()) as User[];
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.db.user.delete({ where: { id } });
    return true;
  }
}
