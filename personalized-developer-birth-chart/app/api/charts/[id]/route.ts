import { NextRequest } from 'next/server';
import { chartHandlers } from '../../../../../api/routes/charts';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return chartHandlers.getChartById(request, params.id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Delete chart implementation would go here
  return new Response('Not implemented', { status: 501 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const format = searchParams.get('format');

  if (action === 'export') {
    return chartHandlers.exportChart(request, params.id, format as any);
  }

  if (action === 'share') {
    const platform = searchParams.get('platform');
    return chartHandlers.shareChart(request, params.id, platform!);
  }

  return new Response('Invalid action', { status: 400 });
}