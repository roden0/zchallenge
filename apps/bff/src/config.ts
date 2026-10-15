export interface Config {
  port: number;
  upstreamApiUrl: string | undefined;
  upstreamApiKey: string | undefined;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number.parseInt(env.PORT ?? '3001', 10),
    upstreamApiUrl: env.UPSTREAM_API_URL,
    upstreamApiKey: env.UPSTREAM_API_KEY,
  };
}
