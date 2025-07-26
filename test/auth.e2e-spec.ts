import { getRequest } from './config/setup';

describe('AuthModule', () => {
  describe('/auth/google (GET)', () => {
    describe('When the user tries to login with Google', () => {
      it('Should redirect to Google OAuth', async () => {
        await getRequest().get('/auth/google').expect(302);
      });
    });
  });

  describe('/auth/github (GET)', () => {
    describe('When the user tries to login with Github', () => {
      it('Should redirect to Github OAuth', async () => {
        await getRequest().get('/auth/github').expect(302);
      });
    });
  });

  describe('/auth/profile (GET)', () => {
    describe('When the user tries to access their profile without being authenticated', () => {
      it('Should throw an 401 error', async () => {
        await getRequest().get('/auth/profile').expect(401);
      });
    });
  });
});
