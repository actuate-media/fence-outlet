import { handleMcpProtectedResource } from '@prenta/core/api';

export function GET() {
  return handleMcpProtectedResource();
}
