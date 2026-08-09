export interface ConfirmationOrderData {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    finalPaidAmount?: number;
  }>;
  shippingFee?: number;
  subtotal?: number;
  total: number;
}

/**
 * Builds the exact customer order confirmation message format.
 * Example output:
 * Hi John,
 * 
 * Thank you for your order!
 * 
 * Order #LA-1042
 * Black Oversized T-Shirt × 1 — ৳850
 * Delivery — ৳60
 * Total — ৳910
 */
export function buildOrderConfirmationMessage(order: ConfirmationOrderData): string {
  const rawName = order.customerName ? order.customerName.trim() : 'Customer';
  const firstName = rawName.split(' ')[0] || rawName;

  // Calculate or retrieve delivery fee
  let delivery = order.shippingFee;
  if (delivery === undefined || delivery === null) {
    const itemsTotal = order.items.reduce((sum, item) => {
      const cost = item.finalPaidAmount !== undefined ? item.finalPaidAmount : (item.price * item.quantity);
      return sum + cost;
    }, 0);
    delivery = Math.max(0, order.total - itemsTotal);
  }

  const itemLines = order.items.map(item => {
    const cost = item.finalPaidAmount !== undefined ? item.finalPaidAmount : (item.price * item.quantity);
    return `${item.productName} × ${item.quantity} — ৳${Math.round(cost)}`;
  }).join('\n');

  const deliveryText = delivery > 0 ? `Delivery — ৳${Math.round(delivery)}` : 'Delivery — Free';

  return `Hi ${firstName},

Thank you for your order!

Order #${order.id}
${itemLines}
${deliveryText}
Total — ৳${Math.round(order.total)}`;
}

/**
 * Copies the confirmation details to clipboard and redirects to customer's phone/WhatsApp number.
 */
export async function sendOrderConfirmation(
  order: ConfirmationOrderData,
  onSuccess?: (msg: string) => void
): Promise<string> {
  const message = buildOrderConfirmationMessage(order);

  // 1. Copy message to clipboard
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(message);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  } catch (err) {
    console.warn("Clipboard copy fallback used:", err);
  }

  if (onSuccess) {
    onSuccess(message);
  }

  // 2. Redirect to customer number via WhatsApp or tel/sms
  const phone = order.customerPhone ? order.customerPhone.trim() : '';
  if (phone) {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '88' + cleanPhone; // Bangladesh phone prefix standard
    }

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  return message;
}
