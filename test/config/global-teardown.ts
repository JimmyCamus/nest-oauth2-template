import { teardownE2E } from './setup';

export default async function globalTeardown() {
  await teardownE2E();
}
