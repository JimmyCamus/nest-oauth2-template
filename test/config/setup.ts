import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { StartedTestContainer } from 'testcontainers';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { runTestContainers } from './db';

let app: INestApplication<App>;
let postgresContainer: StartedTestContainer;
let redisContainer: StartedTestContainer;

let initialized = false;

export const getApp = () => app;
export const getRequest = () => request(app.getHttpServer());

export async function setupE2E() {
  if (initialized) return;

  const containers = await runTestContainers();
  postgresContainer = containers.postgres;
  redisContainer = containers.redis;

  const { AppModule } = await import('./../../src/app/app.module');

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  initialized = true;
}

export async function teardownE2E() {
  console.log('Shoting down E2E tests...');
  await app?.close();
  await postgresContainer?.stop();
  await redisContainer?.stop();
}
