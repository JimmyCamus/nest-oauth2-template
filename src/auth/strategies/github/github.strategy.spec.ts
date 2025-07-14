/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ConfigService } from '../../../config/services/config.service';
import { Profile } from 'passport-github2';
import { GithubStrategy } from './github.strategy';

describe('auth/guards/github-strategy', () => {
  let strategy: GithubStrategy;
  let mockConfigService: Partial<ConfigService>;
  const defaultMockProfile = {
    id: '123456',
    displayName: 'John Doe',
    profileUrl: 'http://github.com/johndoe',
    provider: 'github',
    name: { givenName: 'John', familyName: 'Doe' },
    emails: [{ value: 'john@example.com' }],
    photos: [{ value: 'http://photo.url' }],
  } as Profile;

  beforeEach(() => {
    mockConfigService = {
      githubSecrets: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        callbackUrl: 'http://localhost/callback',
      },
    };
    strategy = new GithubStrategy(mockConfigService as ConfigService);
  });

  it('should call done with user object from profile', () => {
    const mockProfile = defaultMockProfile;
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';
    const done = jest.fn();

    strategy.validate(accessToken, refreshToken, mockProfile, done);

    expect(done).toHaveBeenCalledWith(null, {
      email: mockProfile.emails?.[0].value,
      firstName: mockProfile.name?.givenName,
      lastName: mockProfile.name?.familyName,
      picture: mockProfile.photos?.[0].value,
      accessToken,
      refreshToken,
    });
  });

  it('should handle missing emails', () => {
    const mockProfile = { ...defaultMockProfile, emails: undefined };
    const done = jest.fn();

    strategy.validate('token', 'refresh', mockProfile, done);

    expect(done.mock.calls[0][1].email).toBeUndefined();
  });

  it('should handle missing name', () => {
    const mockProfile = { ...defaultMockProfile, name: undefined };
    const done = jest.fn();

    strategy.validate('token', 'refresh', mockProfile, done);

    expect(done.mock.calls[0][1].firstName).toBeUndefined();
    expect(done.mock.calls[0][1].lastName).toBeUndefined();
  });

  it('should handle missing photos', () => {
    const mockProfile = { ...defaultMockProfile, photos: undefined };
    const done = jest.fn();

    strategy.validate('token', 'refresh', mockProfile, done);

    expect(done.mock.calls[0][1].picture).toBeUndefined();
  });
});
