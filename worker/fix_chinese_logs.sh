#!/bin/bash

# 创建备份
cp /workspaces/-proxy-worker/worker/src/index.js /workspaces/-proxy-worker/worker/src/index.js.bak-fix2

# 替换常见的中文日志消息为英文，避免构建问题
sed -i 's/console\.log("自动刷新触发/console.log("Auto refresh triggered/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("自动刷新完成，结果:/console.log("Auto refresh completed, result:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.error("自动刷新出错:/console.error("Auto refresh error:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("开始执行定时任务：获取代理列表/console.log("Starting scheduled task: fetching proxy list/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("定时任务执行完成"/console.log("Scheduled task completed"/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.error("定时任务执行失败:/console.error("Scheduled task failed:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("开始读取最新代理数据，时间:/console.log("Starting to read latest proxy data, time:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("成功获取现有代理列表作为备份，共/console.log("Successfully retrieved existing proxy list as backup, total/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.error("读取现有代理列表失败:/console.error("Failed to read existing proxy list:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("尝试从/console.log("Trying to fetch from/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("成功获取代理数据文件"/console.log("Successfully fetched proxy data file"/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.error("解析代理数据失败:/console.error("Failed to parse proxy data:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("保留现有地区信息:/console.log("Preserving existing region info:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("完成地区信息合并，共更新/console.log("Region info merge completed, updated/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("更新代理时间戳为:/console.log("Updating proxy timestamp to:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("成功更新静态代理文件"/console.log("Successfully updated static proxy file"/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.error("更新静态代理文件失败:/console.error("Failed to update static proxy file:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.error("写入静态代理文件时出错:/console.error("Error writing static proxy file:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("成功更新代理列表到 KV，共/console.log("Successfully updated proxy list to KV, total/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("文件中的代理数据为空或格式无效"/console.log("Proxy data in file is empty or invalid"/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("无法获取代理数据文件:/console.log("Unable to fetch proxy data file:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.error("获取代理数据文件失败:/console.error("Failed to fetch proxy data file:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.log("已更新代理文件，共/console.log("Updated proxy file, total/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/console\.error("更新代理文件失败:/console.error("Failed to update proxy file:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/无法执行定时任务：proxyworker KV 命名空间未绑定!/Cannot execute scheduled task: proxyworker KV namespace not bound!/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/throw new Error("无效的日期时间格式");/throw new Error("Invalid date format");/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/throw new Error("HTTP 错误:/throw new Error("HTTP error:/g' /workspaces/-proxy-worker/worker/src/index.js
sed -i 's/statusElem.textContent = "当前没有代理数据，系统正在采集中，请稍后刷新页面";/statusElem.textContent = "No proxy data available currently, system is collecting, please refresh later";/g' /workspaces/-proxy-worker/worker/src/index.js

echo "修复完成，请检查索引文件"
