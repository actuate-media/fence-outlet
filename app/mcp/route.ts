import { authorizeMcpRequest } from '@prenta/core/api';
import { handleMcpHttp } from '@prenta/mcp-server';
import { GET as cms } from '../api/cms/[[...cms]]/route';

async function handle(request: Request): Promise<Response> {
  const auth = await authorizeMcpRequest(request);
  if (auth instanceof Response) return auth;
  return handleMcpHttp(request, {
    baseUrl: auth.baseUrl,
    apiKey: auth.credential,
    fetchImpl: (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      return cms(new Request(url, init));
    },
  });
}

export const POST = handle;
export const DELETE = handle;
