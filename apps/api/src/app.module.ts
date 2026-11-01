import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './persistence/persistence.module';

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
  ],
})
export class AppModule {}
