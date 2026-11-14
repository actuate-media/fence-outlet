import { handleMcpToken } from '@prenta/core/api';

export function POST(request: Request) {
  return handleMcpToken(request);
}
