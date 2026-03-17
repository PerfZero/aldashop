export async function GET() {
  try {
    let response = await fetch(
      "https://aldalinde.ru/api/products/get_banner_sale_mailing",
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (response.status === 404) {
      response = await fetch(
        "https://aldalinde.ru/api/products/get_banner_sale_mailing/",
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
          cache: "no-store",
        },
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        {
          error: `External API error: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return Response.json(
        { error: "External API returned non-JSON" },
        { status: 502 },
      );
    }

    const data = await response.json();
    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: "Internal server error",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
