# 推送代码到 GitHub 步骤

# 1. 添加所有文件到暂存区
git add .

# 2. 提交代码
git commit -m "feat: 添加阿里云部署配置和文档"

# 3. 关联 GitHub 远程仓库（将下面的 URL 替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/ai-tools-directory.git

# 4. 推送代码到 GitHub
git push -u origin master

# 如果推送失败，可能需要先拉取
# git pull origin master --allow-unrelated-histories
# git push -u origin master
