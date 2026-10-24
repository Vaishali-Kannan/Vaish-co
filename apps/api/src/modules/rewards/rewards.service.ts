import prisma from '../../config/database';
import { AppError, NotFoundError } from '../../middleware/errorHandler';

const COINS_PER_RUPEE = 1; // 1 coin per ₹100
const COIN_VALUE_IN_RUPEES = 0.5; // 1 coin = ₹0.50
const MAX_REDEMPTION_PERCENT = 0.20; // Max 20% of order value can be paid with coins

export async function getRewardBalance(userId: string) {
  const account = await prisma.rewardAccount.findUnique({
    where: { userId },
    select: { balance: true, lifetimeEarned: true, lifetimeRedeemed: true },
  });
  if (!account) return { balance: 0, lifetimeEarned: 0, lifetimeRedeemed: 0 };
  return account;
}

export async function getRewardTransactions(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    prisma.rewardTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.rewardTransaction.count({ where: { userId } }),
  ]);

  return {
    transactions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function quoteRedemption(userId: string, orderTotal: number, requestedCoins: number) {
  const account = await prisma.rewardAccount.findUnique({ where: { userId } });
  if (!account) throw new NotFoundError('Reward account');

  const maxCoinsValue = orderTotal * MAX_REDEMPTION_PERCENT;
  const maxCoins = Math.floor(maxCoinsValue / COIN_VALUE_IN_RUPEES);
  const availableCoins = account.balance;
  const effectiveCoins = Math.min(requestedCoins, maxCoins, availableCoins);
  const redemptionValue = effectiveCoins * COIN_VALUE_IN_RUPEES;

  return {
    requestedCoins,
    effectiveCoins,
    redemptionValue: redemptionValue.toFixed(2),
    maxRedeemable: maxCoins,
    availableBalance: availableCoins,
    coinValue: COIN_VALUE_IN_RUPEES,
    maxRedemptionPercent: MAX_REDEMPTION_PERCENT * 100,
  };
}

export async function earnCoins(
  userId: string,
  orderId: string,
  orderTotal: number,
  tx?: any
) {
  const db = tx || prisma;
  const coinsEarned = Math.floor(orderTotal / 100) * COINS_PER_RUPEE;
  if (coinsEarned <= 0) return 0;

  await db.rewardAccount.update({
    where: { userId },
    data: {
      balance: { increment: coinsEarned },
      lifetimeEarned: { increment: coinsEarned },
    },
  });

  await db.rewardTransaction.create({
    data: {
      userId,
      orderId,
      type: 'EARNED',
      coins: coinsEarned,
      reason: `Earned for order purchase`,
      status: 'COMPLETED',
    },
  });

  return coinsEarned;
}

export async function redeemCoins(
  userId: string,
  orderId: string,
  coins: number,
  tx?: any
) {
  const db = tx || prisma;

  const account = await db.rewardAccount.findUnique({ where: { userId } });
  if (!account || account.balance < coins) {
    throw new AppError('Insufficient reward balance', 400);
  }

  await db.rewardAccount.update({
    where: { userId },
    data: {
      balance: { decrement: coins },
      lifetimeRedeemed: { increment: coins },
    },
  });

  await db.rewardTransaction.create({
    data: {
      userId,
      orderId,
      type: 'REDEEMED',
      coins,
      reason: `Redeemed for order`,
      status: 'COMPLETED',
    },
  });
}

export async function reverseRedemption(userId: string, orderId: string, coins: number, tx?: any) {
  const db = tx || prisma;
  await db.rewardAccount.update({
    where: { userId },
    data: {
      balance: { increment: coins },
      lifetimeRedeemed: { decrement: coins },
    },
  });

  await db.rewardTransaction.create({
    data: {
      userId,
      orderId,
      type: 'ADJUSTED',
      coins,
      reason: 'Refunded due to order cancellation/return',
      status: 'COMPLETED',
    },
  });
}
