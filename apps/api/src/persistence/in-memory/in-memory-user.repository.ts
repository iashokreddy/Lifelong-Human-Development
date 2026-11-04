import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NewUser, User, UserRepository } from '../repositories';

/** In-memory UserRepository backed by a Map. Default implementation. */
@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  async create(user: NewUser): Promise<User> {
    const created: User = { id: randomUUID(), ...user };
    this.users.set(created.id, created);
    return { ...created };
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, { ...user });
    return { ...user };
  }

  async findById(id: string): Promise<User | null> {
    const found = this.users.get(id);
    return found ? { ...found } : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return { ...user };
      }
    }
    return null;
  }

  async list(): Promise<User[]> {
    return [...this.users.values()].map((u) => ({ ...u }));
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}
