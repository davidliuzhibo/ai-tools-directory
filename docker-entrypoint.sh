#!/bin/sh
set -e

# 等待数据库就绪
echo "等待数据库连接..."
# 使用项目中安装的 prisma 版本，而不是 npx 下载的最新版
node_modules/.bin/prisma migrate deploy

# 启动应用
exec "$@"
