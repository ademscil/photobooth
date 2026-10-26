import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Global Edge/API Middleware
 *
 * Security Mitigations:
 * - Anti-Node2Shell (CVE-2026-111497): Blocks Brotli-encoded inbound request bodies
 *   preventing native Brotli decoder out-of-bounds write / RCE.
 */
export function middleware(request: NextRequest) {
  const contentEncoding = request.headers.get('content-encoding');
  if (contentEncoding && (contentEncoding.toLowerCase().includes('br') || contentEncoding.toLowerCase().includes('brotli'))) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Brotli request body compression is disabled due to security advisory CVE-2026-111497 (Node2Shell). Please send uncompressed or gzip payloads.',
      }),
      {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

