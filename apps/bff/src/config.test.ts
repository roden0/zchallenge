import { expect } from 'chai';
import { loadConfig } from './config.js';

const FAKE_KEY = 'test-key-4f9a1c-LEAK-CANARY';
const VALID_URL = 'https://upstream.example.test';

function env(overrides: Record<string, string | undefined>): NodeJS.ProcessEnv {
  return {
    UPSTREAM_API_URL: VALID_URL,
    UPSTREAM_API_KEY: FAKE_KEY,
    ...overrides,
  };
}

describe('loadConfig', () => {
  it('throws naming UPSTREAM_API_KEY when it is missing', () => {
    expect(() => loadConfig(env({ UPSTREAM_API_KEY: undefined }))).to.throw(
      /UPSTREAM_API_KEY/,
    );
  });

  it('throws naming UPSTREAM_API_KEY when it is empty', () => {
    expect(() => loadConfig(env({ UPSTREAM_API_KEY: '' }))).to.throw(
      /UPSTREAM_API_KEY/,
    );
  });

  it('throws naming UPSTREAM_API_URL when it is missing', () => {
    expect(() => loadConfig(env({ UPSTREAM_API_URL: undefined }))).to.throw(
      /UPSTREAM_API_URL/,
    );
  });

  it('throws when UPSTREAM_API_URL is not an absolute URL', () => {
    expect(() => loadConfig(env({ UPSTREAM_API_URL: 'not-a-url' }))).to.throw(
      /UPSTREAM_API_URL/,
    );
  });

  it('throws when UPSTREAM_API_URL is not http or https', () => {
    expect(() =>
      loadConfig(env({ UPSTREAM_API_URL: 'ftp://example.test' })),
    ).to.throw(/UPSTREAM_API_URL/);
  });

  it('never includes the key value in an error message', () => {
    let message = '';
    try {
      loadConfig(env({ UPSTREAM_API_URL: 'not-a-url' }));
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).to.not.contain(FAKE_KEY);
    expect(message).to.not.contain('not-a-url');
  });

  it('applies the default timeout and port', () => {
    const config = loadConfig(env({}));

    expect(config.upstreamTimeoutMs).to.equal(15000);
    expect(config.port).to.equal(3001);
    expect(config.upstreamApiUrl).to.equal(VALID_URL);
    expect(config.upstreamApiKey).to.equal(FAKE_KEY);
  });

  it('parses an explicit timeout and port', () => {
    const config = loadConfig(
      env({ UPSTREAM_TIMEOUT_MS: '2500', PORT: '4000' }),
    );

    expect(config.upstreamTimeoutMs).to.equal(2500);
    expect(config.port).to.equal(4000);
  });

  it('throws on a non-numeric timeout', () => {
    expect(() => loadConfig(env({ UPSTREAM_TIMEOUT_MS: 'soon' }))).to.throw(
      /UPSTREAM_TIMEOUT_MS/,
    );
  });

  it('throws on an out-of-range port', () => {
    expect(() => loadConfig(env({ PORT: '70000' }))).to.throw(/PORT/);
  });
});
