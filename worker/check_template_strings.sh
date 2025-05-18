#!/bin/bash

echo "正在检查index.js中可能导致构建问题的模板字符串..."

# 查找含有中文的模板字符串
grep -n "console\.log(\`.*[\u4e00-\u9fa5].*\`)" /workspaces/-proxy-worker/worker/src/index.js
grep -n "console\.error(\`.*[\u4e00-\u9fa5].*\`)" /workspaces/-proxy-worker/worker/src/index.js

# 检查所有模板字符串
grep -n "console\.log(\`.*\`)" /workspaces/-proxy-worker/worker/src/index.js
grep -n "console\.error(\`.*\`)" /workspaces/-proxy-worker/worker/src/index.js

echo "检查完成"
