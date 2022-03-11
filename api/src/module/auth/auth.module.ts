import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { TEST_USER_ID } from './auth';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: 'TEST_USER',
      inject: [Connection],
      useFactory: async (connection: Connection) => {
        const userRepo = connection.getRepository(User);
        let user = await userRepo.findOne();
        if (!user) {
          user = await userRepo.save({
            id: TEST_USER_ID,
            email: 'test-user@company.co',
            firstName: 'Test',
            lastName: 'User',
          });
          console.log('Test user has been created!');
        }
        return user;
      },
    },
  ],
  controllers: [],
  exports: [],
})
export class AuthModule {}
