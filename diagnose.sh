#!/bin/bash
# 诊断脚本 - 找出404错误的根本原因

echo "========================================="
echo "1. 检查代码版本"
echo "========================================="
cd /opt/aitools
git log --oneline -1
echo ""

echo "========================================="
echo "2. 检查next.config.ts配置"
echo "========================================="
grep -C2 "output" next.config.ts || echo "No 'output' config found (正确)"
echo ""

echo "========================================="
echo "3. 检查category page配置"
echo "========================================="
head -10 src/app/category/[slug]/page.tsx
echo ""

echo "========================================="
echo "4. 检查数据库中的分类"
echo "========================================="
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.categories.findMany().then(cats => {
  console.log('总分类数:', cats.length);
  cats.forEach(c => console.log('  -', c.slug, '|', c.name));
  process.exit(0);
}).catch(err => {
  console.error('数据库错误:', err.message);
  process.exit(1);
});
"
echo ""

echo "========================================="
echo "5. 测试分类页面HTTP响应"
echo "========================================="
for slug in language image code video note assistant; do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/category/$slug)
  echo "  /category/$slug: HTTP $status"
done
echo ""

echo "========================================="
echo "6. 检查PM2状态和最新日志"
echo "========================================="
pm2 list
echo ""
echo "最新错误日志:"
pm2 logs aitools --lines 10 --nostream --err
echo ""

echo "========================================="
echo "7. 检查.next/BUILD_ID"
echo "========================================="
cat .next/BUILD_ID
echo ""

echo "========================================="
echo "8. 测试API接口"
echo "========================================="
curl -s http://localhost:3000/api/categories | head -100
echo ""

echo "诊断完成！"
