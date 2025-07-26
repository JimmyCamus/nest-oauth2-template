import { GenericContainer } from 'testcontainers';

const POSTGRES_PORT = 5432;
const REDIS_PORT = 6379;

export const runTestContainers = async () => {
  const postgres = await new GenericContainer('postgres:17.5-alpine')
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'testdb',
    })
    .withExposedPorts(POSTGRES_PORT)
    .start();

  const redis = await new GenericContainer('redis:8.0.3-alpine')
    .withExposedPorts(REDIS_PORT)
    .withCommand(['redis-server', '--requirepass', 'test'])
    .start();

  process.env.DATABASE_HOST = postgres.getHost();
  process.env.DATABASE_PORT = postgres.getMappedPort(POSTGRES_PORT).toString();

  process.env.REDIS_HOST = redis.getHost();
  process.env.REDIS_PORT = redis.getMappedPort(REDIS_PORT).toString();

  return { postgres, redis };
};
