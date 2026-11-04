import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { InMemoryUserRepository } from '../persistence/in-memory/in-memory-user.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let users: InMemoryUserRepository;
  let service: AuthService;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    service = new AuthService(users, new JwtService({ secret: 'test-secret' }));
  });

  it('stores the password as a bcrypt hash, never plaintext', async () => {
    await service.register({
      email: 'parent@example.com',
      password: 'correct horse battery',
      displayName: 'Parent',
    });

    const stored = await users.findByEmail('parent@example.com');
    expect(stored).not.toBeNull();
    expect(stored!.passwordHash).not.toBe('correct horse battery');
    expect(stored!.passwordHash.startsWith('$2')).toBe(true);
  });

  it('issues a signed access token on register', async () => {
    const result = await service.register({
      email: 'learner@example.com',
      password: 'correct horse battery',
      displayName: 'Learner',
    });
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.user.email).toBe('learner@example.com');
    expect(result.user.role).toBe('learner');
  });

  it('rejects a duplicate email registration', async () => {
    await service.register({
      email: 'dup@example.com',
      password: 'correct horse battery',
      displayName: 'A',
    });
    await expect(
      service.register({
        email: 'dup@example.com',
        password: 'another password',
        displayName: 'B',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('validateUser accepts the correct password', async () => {
    await service.register({
      email: 'ok@example.com',
      password: 'the right password',
      displayName: 'OK',
    });
    const user = await service.validateUser('ok@example.com', 'the right password');
    expect(user).not.toBeNull();
    expect(user!.email).toBe('ok@example.com');
  });

  it('validateUser rejects a wrong password', async () => {
    await service.register({
      email: 'wrong@example.com',
      password: 'the right password',
      displayName: 'Wrong',
    });
    const user = await service.validateUser('wrong@example.com', 'a bad guess');
    expect(user).toBeNull();
  });

  it('validateUser returns null for an unknown email', async () => {
    const user = await service.validateUser('nobody@example.com', 'whatever');
    expect(user).toBeNull();
  });
});
