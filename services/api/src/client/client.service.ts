import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientDao } from '../firestore/daos/client.dao';
import { toIsoString } from '../firestore/firestore.utils';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class ClientService {
  constructor(
    private readonly clientDao: ClientDao,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(tenantId: string) {
    const clients = await this.clientDao.listClients(tenantId);
    return clients.map((c) => ({
      ...c,
      tenantId,
      birthDate: toIsoString(c.birthDate) ?? c.birthDate,
      certificationDate: toIsoString(c.certificationDate) ?? c.certificationDate,
      createdAt: toIsoString(c.createdAt) ?? c.createdAt,
      updatedAt: toIsoString(c.updatedAt) ?? c.updatedAt,
    }));
  }

  async findOne(id: string, tenantId: string) {
    const client = await this.clientDao.getClient(tenantId, id);
    if (!client) throw new NotFoundException('蛻ｩ逕ｨ閠・′隕九▽縺九ｊ縺ｾ縺帙ｓ');
    return {
      ...client,
      tenantId,
      birthDate: toIsoString(client.birthDate) ?? client.birthDate,
      certificationDate: toIsoString(client.certificationDate) ?? client.certificationDate,
      createdAt: toIsoString(client.createdAt) ?? client.createdAt,
      updatedAt: toIsoString(client.updatedAt) ?? client.updatedAt,
    };
  }

  async create(dto: CreateClientDto, tenantId: string, req?: import('express').Request) {
    const { id } = await this.clientDao.createClient(tenantId, {
      tenantId,
      familyName: dto.familyName,
      givenName: dto.givenName,
      familyNameKana: dto.familyNameKana,
      givenNameKana: dto.givenNameKana,
      birthDate: new Date(dto.birthDate),
      gender: dto.gender,
      insuranceNumber: dto.insuranceNumber,
      careLevel: dto.careLevel,
      certificationDate: new Date(dto.certificationDate),
      address: dto.address,
      phone: dto.phone,
    });
    this.auditLog.log({
      eventType: 'CLIENT_CREATE',
      tenantId,
      resourceId: id,
      result: 'SUCCESS',
    }, req);
    return this.findOne(id, tenantId);
  }

  async update(id: string, dto: UpdateClientDto, tenantId: string, req?: import('express').Request) {
    await this.findOne(id, tenantId);
    await this.clientDao.updateClient(tenantId, id, {
      ...(dto.familyName !== undefined && { familyName: dto.familyName }),
      ...(dto.givenName !== undefined && { givenName: dto.givenName }),
      ...(dto.familyNameKana !== undefined && { familyNameKana: dto.familyNameKana }),
      ...(dto.givenNameKana !== undefined && { givenNameKana: dto.givenNameKana }),
      ...(dto.birthDate !== undefined && { birthDate: new Date(dto.birthDate) }),
      ...(dto.gender !== undefined && { gender: dto.gender }),
      ...(dto.insuranceNumber !== undefined && { insuranceNumber: dto.insuranceNumber }),
      ...(dto.careLevel !== undefined && { careLevel: dto.careLevel }),
      ...(dto.certificationDate !== undefined && {
        certificationDate: new Date(dto.certificationDate),
      }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
    });
    this.auditLog.log({
      eventType: 'CLIENT_UPDATE',
      tenantId,
      resourceId: id,
      result: 'SUCCESS',
    }, req);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string, req?: import('express').Request) {
    await this.findOne(id, tenantId);
    await this.clientDao.deleteClient(tenantId, id);
    this.auditLog.log({
      eventType: 'CLIENT_DELETE',
      tenantId,
      resourceId: id,
      result: 'SUCCESS',
    }, req);
    return { id };
  }
}
