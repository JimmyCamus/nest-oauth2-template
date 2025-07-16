/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { GoogleStrategy } from './google.strategy';
import { ConfigService } from '../../../config/services/config.service';
import { Profile } from 'passport-google-oauth20';
import { HttpException } from '@nestjs/common';

describe('auth/guards/google-strategy', () => {
  let strategy: GoogleStrategy;
  let mockConfigService: Partial<ConfigService>;
  const defaultMockProfile = {
    name: { givenName: 'John', familyName: 'Doe' },
    emails: [{ value: 'john@example.com', verified: true }],
    photos: [{ value: 'http://photo.url' }],
  } as Profile;

  beforeEach(() => {
    mockConfigService = {
      googleSecrets: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        callbackUrl: 'http://localhost/callback',
      },
    };
    strategy = new GoogleStrategy(mockConfigService as ConfigService);
  });

  it('should call done with user object from profile', () => {
    const mockProfile = defaultMockProfile;
    const done = jest.fn();

    strategy.validate('token', 'refresh', mockProfile, done);

    expect(done).toHaveBeenCalledWith(null, {
      email: mockProfile.emails?.[0].value,
      firstName: mockProfile.name?.givenName,
      lastName: mockProfile.name?.familyName,
      picture: mockProfile.photos?.[0].value,
    });
  });

  it('should handle missing emails', () => {
    const mockProfile = { ...defaultMockProfile, emails: undefined };
    const done = jest.fn();

    try {
      strategy.validate('token', 'refresh', mockProfile, done);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('Email not found in Google profile');
    }
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
