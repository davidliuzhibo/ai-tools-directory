// PM2 配置文件 - 用于管理 Next.js 应用进程
// 使用方法：pm2 start ecosystem.config.js

module.exports = {
  apps: [{
    // 应用名称
    name: 'ai-tools-directory',

    // 启动脚本
    script: 'npm',
    args: 'start',

    // 工作目录（根据实际路径修改）
    cwd: '/var/www/ai-tools-directory',

    // 集群模式 - 根据CPU核心数启动多个实例
    instances: 2,  // 或使用 'max' 自动根据CPU核心数
    exec_mode: 'cluster',

    // 环境变量
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // 日志文件路径
    error_file: '/var/www/ai-tools-directory/logs/error.log',
    out_file: '/var/www/ai-tools-directory/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,

    // 自动重启配置
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',

    // 内存限制 - 超过1GB自动重启
    max_memory_restart: '1G',

    // 监听文件变化（生产环境建议关闭）
    watch: false,

    // 忽略监听的文件/目录
    ignore_watch: [
      'node_modules',
      'logs',
      '.next/cache'
    ],

    // 优雅关闭
    kill_timeout: 5000,

    // 等待应用就绪时间
    listen_timeout: 10000,

    // 定时任务（每天凌晨2点重启）
    cron_restart: '0 2 * * *'
  }]
};
