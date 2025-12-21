import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

/**
 * 检查当前用户是否为管理员
 * @returns 如果是管理员返回 session，否则返回 null
 */
export async function checkAdminPermission() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // 检查用户是否在 admins 表中
  const admin = await prisma.admins.findUnique({
    where: { userId: session.user.id },
  });

  if (!admin) {
    return null;
  }

  return session;
}

/**
 * 检查指定用户ID是否为管理员
 * @param userId - 用户ID
 * @returns 如果是管理员返回 true，否则返回 false
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const admin = await prisma.admins.findUnique({
    where: { userId },
  });

  return !!admin;
}
