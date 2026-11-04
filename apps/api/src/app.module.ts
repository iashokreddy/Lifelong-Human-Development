import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './persistence/persistence.module';
import { ContentModule } from './content/content.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgressModule } from './progress/progress.module';
import { AiModule } from './ai/ai.module';

/**
 * Root module for the LHD modular monolith.
 *
 * Later features register additional modules here: ContentModule, AuthModule,
 * UsersModule, ProgressModule, AiModule. PersistenceModule is the shared
 * data-access foundation they all build on.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PersistenceModule,
    ContentModule,
    AuthModule,
    UsersModule,
    ProgressModule,
    AiModule,
  ],
})
export class AppModule {}
