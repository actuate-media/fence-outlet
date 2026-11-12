import { handleMcpAuthorize } from '@prenta/core/api';

export function GET(request: Request) {
  return handleMcpAuthorize(request);
}
