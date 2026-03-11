const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_WEBHOOK_URL = "https://aldalinde.bitrix24.ru/rest/1/ma6pc0gpi40isu9l/";

function getWebhookBase() {
  const webhook = process.env.BITRIX_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
  if (!webhook) {
    return null;
  }
  return webhook.endsWith("/") ? webhook.slice(0, -1) : webhook;
}

export async function POST(request) {
  try {
    const webhookBase = getWebhookBase();
    if (!webhookBase) {
      return Response.json(
        { error: "BITRIX_WEBHOOK_URL is not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const email = String(body?.email || "").trim();
    const pageUrl = String(body?.pageUrl || "").trim();

    if (!EMAIL_REGEX.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    const payload = {
      fields: {
        TITLE: `Подписка с сайта ALDA (${email})`,
        NAME: email,
        SOURCE_ID: "WEB",
        SOURCE_DESCRIPTION: "Popup subscription",
        EMAIL: [{ VALUE: email, VALUE_TYPE: "WORK" }],
        COMMENTS: pageUrl
          ? `Email: ${email}\nИсточник: popup на сайте\nСтраница: ${pageUrl}`
          : `Email: ${email}\nИсточник: popup на сайте`,
      },
      params: {
        REGISTER_SONET_EVENT: "Y",
      },
    };

    const response = await fetch(`${webhookBase}/crm.lead.add.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.error) {
      return Response.json(
        {
          error: data?.error_description || data?.error || "Bitrix API error",
        },
        { status: 502 },
      );
    }

    return Response.json({ success: true, leadId: data.result }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
