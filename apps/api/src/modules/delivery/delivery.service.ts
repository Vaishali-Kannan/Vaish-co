import prisma from '../../config/database';
import { NotFoundError, AppError } from '../../middleware/errorHandler';
import { DeliveryMode } from '@prisma/client';

// Delivery rules configuration
const DELIVERY_RULES = {
  [DeliveryMode.QUICK]: {
    label: 'Quick Delivery',
    description: 'Within 2 hours',
    fee: 49,
    freeAbove: 500,
    cutOffHour: 20, // 8 PM
    availablePincodes: ['400001', '400002', '400003', '110001', '110002', '560001', '560002'],
  },
  [DeliveryMode.FAST]: {
    label: 'Fast Delivery',
    description: '1-2 business days',
    fee: 29,
    freeAbove: 499,
    cutOffHour: 18, // 6 PM
    availableStates: ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Telangana', 'Gujarat'],
  },
  [DeliveryMode.STANDARD]: {
    label: 'Standard Delivery',
    description: '3-7 business days',
    fee: 0, // free standard delivery
    freeAbove: 0,
  },
};

export async function checkDeliveryEligibility(
  pincode: string,
  productIds: string[],
  requestedMode: DeliveryMode
) {
  const rule = DELIVERY_RULES[requestedMode];
  const now = new Date();
  const currentHour = now.getHours();

  // Check product eligibility
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isPublished: true },
    select: { id: true, name: true, deliveryModes: true, inventory: true },
  });

  const ineligibleProducts = products.filter(
    (p) => !p.deliveryModes.includes(requestedMode)
  );

  const outOfStockProducts = products.filter(
    (p) => (p.inventory?.quantity ?? 0) - (p.inventory?.reservedQty ?? 0) <= 0
  );

  // Check pincode/area for quick delivery
  let pincodeEligible = true;
  let message = '';

  if (requestedMode === DeliveryMode.QUICK) {
    const rule = DELIVERY_RULES[DeliveryMode.QUICK];
    pincodeEligible = rule.availablePincodes.includes(pincode);
    if (!pincodeEligible) {
      message = `Quick delivery is not available at pincode ${pincode}. Try Fast or Standard delivery.`;
    } else if (currentHour >= rule.cutOffHour) {
      message = `Quick delivery cut-off time has passed (${rule.cutOffHour}:00). Will be delivered tomorrow.`;
    }
  }

  const estimatedDelivery = getEstimatedDelivery(requestedMode, pincode);

  return {
    mode: requestedMode,
    label: rule.label,
    description: rule.description,
    isEligible: pincodeEligible && ineligibleProducts.length === 0 && outOfStockProducts.length === 0,
    fee: rule.fee,
    freeAbove: (rule as any).freeAbove ?? 0,
    estimatedDelivery,
    message: message || (ineligibleProducts.length > 0
      ? `${ineligibleProducts.length} item(s) not eligible for ${rule.label}`
      : outOfStockProducts.length > 0
        ? `${outOfStockProducts.length} item(s) out of stock`
        : ''),
    ineligibleProducts: ineligibleProducts.map((p) => ({ id: p.id, name: p.name })),
    outOfStockProducts: outOfStockProducts.map((p) => ({ id: p.id, name: p.name })),
  };
}

function getEstimatedDelivery(mode: DeliveryMode, pincode: string): string {
  const now = new Date();
  
  switch (mode) {
    case DeliveryMode.QUICK: {
      const eta = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      return `Today by ${eta.getHours()}:${String(eta.getMinutes()).padStart(2, '0')} PM`;
    }
    case DeliveryMode.FAST: {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + (now.getHours() < 18 ? 1 : 2));
      return `${tomorrow.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}`;
    }
    case DeliveryMode.STANDARD: {
      const minDate = new Date(now);
      const maxDate = new Date(now);
      minDate.setDate(minDate.getDate() + 3);
      maxDate.setDate(maxDate.getDate() + 7);
      return `${minDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – ${maxDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
    }
  }
}

export function getDeliveryFee(mode: DeliveryMode, subtotal: number): number {
  const rule = DELIVERY_RULES[mode];
  const freeAbove = (rule as any).freeAbove ?? 0;
  if (subtotal >= freeAbove && freeAbove > 0) return 0;
  return rule.fee;
}

export async function getDeliveryOptions(pincode: string, productIds: string[]) {
  const [quick, fast, standard] = await Promise.all([
    checkDeliveryEligibility(pincode, productIds, DeliveryMode.QUICK),
    checkDeliveryEligibility(pincode, productIds, DeliveryMode.FAST),
    checkDeliveryEligibility(pincode, productIds, DeliveryMode.STANDARD),
  ]);

  return { options: [quick, fast, standard] };
}
