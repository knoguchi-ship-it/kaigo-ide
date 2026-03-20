import { Global, Module } from '@nestjs/common';
import { CarePlanDao } from './daos/care-plan.dao';
import { CareRecordDao } from './daos/care-record.dao';
import { ClientDao } from './daos/client.dao';
import { MonitoringRecordDao } from './daos/monitoring-record.dao';
import { TenantDao } from './daos/tenant.dao';
import { UserDao } from './daos/user.dao';
import { FirestoreService } from './firestore.service';

@Global()
@Module({
  providers: [
    FirestoreService,
    TenantDao,
    UserDao,
    ClientDao,
    CarePlanDao,
    CareRecordDao,
    MonitoringRecordDao,
  ],
  exports: [
    FirestoreService,
    TenantDao,
    UserDao,
    ClientDao,
    CarePlanDao,
    CareRecordDao,
    MonitoringRecordDao,
  ],
})
export class FirestoreModule {}
