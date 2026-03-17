export async function GET(request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const authHeader = request.headers.get("authorization");

    const headers = {
      accept: "application/json",
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    const response = await fetch("https://aldalinde.ru/api/products/get_banner/", {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        {
          error: "API Error",
          details: response.status,
          message: errorText,
        },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      const bodySnippet = await response.text();
      return Response.json(
        {
          error: "Invalid response type",
          message: bodySnippet.slice(0, 200),
        },
        { status: 502 },
      );
    }

    const data = await response.json();
    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: "API Error",
        details: 500,
        message: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
