export async function GET(request) {
  try {
    console.log('👤 /api/auth/user called');
    const authHeader = request.headers.get('authorization');
    console.log('🔑 Auth header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader) {
      console.log('❌ No authorization header');
      return Response.json({ error: 'No authorization header' }, { status: 401 });
    }

    console.log('🌐 Making request to external API...');
    const response = await fetch('http://62.181.44.89/api/user/profile/', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authHeader,
      },
    });

    console.log('📡 External API response status:', response.status);
    const data = await response.json();
    console.log('📡 External API response data:', data);

    if (!response.ok) {
      console.log('❌ External API request failed');
      return Response.json(data, { status: response.status });
    }

    console.log('✅ User data fetched successfully');
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('💥 Error fetching user data:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 