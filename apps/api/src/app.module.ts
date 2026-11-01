import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './persistence/persistence.module';
import { ContentModule } from './content/content.module';

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
  ],
})
export class AppModule {}
