import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

/**
 * 检查当前用户是否为管理员
 * @returns 如果是管理员返回 session，否则返回 null
 */
export async function checkAdminPermission() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session?.user?.email) {
    return null;
  }

  // 1. 优先检查环境变量中配置的管理员邮箱
  const adminEmails = process.env.ADMIN_EMAIL?.split(',').map(e => e.trim()) || [];
  if (adminEmails.includes(session.user.email)) {
    return session;
  }

  // 2. 检查用户是否在 admins 表中
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
  // 1. 先获取用户信息
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) {
    return false;
  }

  // 2. 检查环境变量中配置的管理员邮箱
  const adminEmails = process.env.ADMIN_EMAIL?.split(',').map(e => e.trim()) || [];
  if (adminEmails.includes(user.email)) {
    return true;
  }

  // 3. 检查数据库中的 admins 表
  const admin = await prisma.admins.findUnique({
    where: { userId },
  });

  return !!admin;
}
