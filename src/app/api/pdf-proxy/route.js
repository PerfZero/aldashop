export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let pdfUrl = searchParams.get('url');

  if (!pdfUrl) {
    return new Response('URL parameter is required', { status: 400 });
  }

  try {
    pdfUrl = decodeURIComponent(pdfUrl);
    
    const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `https://aldalinde.ru${pdfUrl}`;
    
    const response = await fetch(fullUrl, {
      headers: {
        'Accept': 'application/pdf',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      console.error('PDF fetch failed:', response.status, response.statusText);
      return new Response(`Failed to fetch PDF: ${response.status} ${response.statusText}`, { 
        status: response.status 
      });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('pdf')) {
      console.warn('Response is not PDF, content-type:', contentType);
    }

    const arrayBuffer = await response.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="document.pdf"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error proxying PDF:', error);
    return new Response(`Error fetching PDF: ${error.message}`, { status: 500 });
  }
}

