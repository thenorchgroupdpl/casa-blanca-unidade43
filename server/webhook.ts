import * as db from "./db";

/**
 * Dispatch a webhook notification for a new order.
 * This function is fire-and-forget: failures are logged but never block the order flow.
 */
export async function dispatchOrderWebhook(tenantId: number, orderData: {
  orderId: number;
  customerName: string;
  summary: string;
  totalValue: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  deliveryZoneName?: string;
  deliveryFee?: string;
  createdAt: string;
}): Promise<void> {
  try {
    const settings = await db.getStoreSettings(tenantId);
    if (!settings?.webhookEnabled || !settings?.webhookUrl) return;

    const payload = {
      event: "new_order",
      title: `Novo Pedido #${orderData.orderId}`,
      text: `${orderData.customerName} — R$ ${orderData.totalValue}`,
      order: {
        id: orderData.orderId,
        customerName: orderData.customerName,
        summary: orderData.summary,
        totalValue: orderData.totalValue,
        items: orderData.items || [],
        deliveryZone: orderData.deliveryZoneName || "Retirada no Local",
        deliveryFee: orderData.deliveryFee || "0.00",
        createdAt: orderData.createdAt,
      },
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(settings.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      console.error(`[Webhook] Failed for tenant ${tenantId}: HTTP ${response.status}`);
    }
  } catch (err) {
    // Silent failure — webhook errors must never block order creation
    console.error(`[Webhook] Error for tenant ${tenantId}:`, err);
  }
}
