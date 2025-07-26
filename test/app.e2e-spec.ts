import { getRequest } from './config/setup';

describe('AppModule', () => {
  it('/health (GET)', async () => {
    const res = await getRequest().get('/health').expect(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      uptime: expect.any(String),
    });
  });
});
