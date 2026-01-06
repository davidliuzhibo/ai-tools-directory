#!/bin/sh
set -e

# 等待数据库就绪
echo "等待数据库连接..."
# 使用全局安装的 prisma CLI
prisma migrate deploy

# 启动应用
exec "$@"
