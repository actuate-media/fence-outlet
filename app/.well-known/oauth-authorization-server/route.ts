import { handleMcpAuthorizationServer } from '@prenta/core/api';

export function GET() {
  return handleMcpAuthorizationServer();
}
