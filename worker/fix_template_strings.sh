#!/bin/bash

# 定义一个函数来修复单行的模板字符串
fix_template_string() {
  local line=$1
  local line_num=$2
  local file=$3
  
  # 从行号提取该行内容
  local content=$(sed -n "${line_num}p" "$file")
  
  # 替换模板字符串为普通字符串连接
  # 这是一个简单的替换，可能不能处理所有情况
  if [[ "$content" =~ \`(.*)\$\{([^}]*)\}(.*)\` ]]; then
    local before="${BASH_REMATCH[1]}"
    local var="${BASH_REMATCH[2]}"
    local after="${BASH_REMATCH[3]}"
    
    # 检查是否有更多变量替换
    while [[ "$after" =~ \$\{([^}]*)\}(.*) ]]; do
      local next_var="${BASH_REMATCH[1]}"
      local next_after="${BASH_REMATCH[2]}"
      after="' + $next_var + '$next_after"
    done
    
    # 构建替换后的字符串
    local replaced="'$before' + $var + '$after'"
    
    # 执行替换
    sed -i "${line_num}s/\`.*\`/$replaced/" "$file"
    echo "修复了 $file 第 $line_num 行: $replaced"
  else
    echo "无法识别模板字符串格式: $content"
  fi
}

# 修复文件中的特定行
fix_line() {
  local line_num=$1
  local file=$2
  local content=$(sed -n "${line_num}p" "$file")
  local fixed_content
  
  case $line_num in
    282)
      fixed_content="            statusElem.textContent = '加载代理失败: ' + err.message + '，请刷新页面重试';"
      ;;
    788)
      fixed_content="    return new Response('静态资源错误: ' + e.message, { status: 500 });"
      ;;
    907)
      fixed_content="      return new Response('服务错误: ' + e.message, { "
      ;;
    955)
      fixed_content="    let baseUrl = requestUrl.protocol + '//' + requestUrl.host;"
      ;;
    1020)
      fixed_content="                console.log('完成地区信息合并，共更新 ' + regionUpdatedCount + ' 个代理的地区信息');"
      ;;
    1045)
      fixed_content="                const assetUpdateUrl = cfUrl.protocol + '//' + cfUrl.host + '/update-proxies';"
      ;;
    1108)
      fixed_content="            console.log('尝试从 ' + apiUrl + ' 获取' + p.type + '代理...');"
      ;;
    1114)
      fixed_content="              console.error('从 ' + apiUrl + ' 获取' + p.type + '代理失败: ' + res.status);"
      ;;
    1121)
      fixed_content="              console.error('从 ' + apiUrl + ' 获取的内容无效，不包含代理数据');"
      ;;
    1147)
      fixed_content="            console.error('从 ' + apiUrl + ' 获取' + p.type + '代理时出错:', e);"
      ;;
    1151)
      fixed_content="        console.error('获取' + p.type + '代理时出错:', e);"
      ;;
    1178)
      fixed_content="      console.log('共获取到 ' + list.length + ' 个代理，准备更新到KV...');"
      ;;
    1183)
      fixed_content="        console.log('成功从API更新代理列表，共' + list.length + '个代理');"
      ;;
    1263)
      fixed_content="      console.log('已更新代理文件，共 ' + proxiesData.length + ' 个条目');"
      ;;
    *)
      echo "未找到针对行 $line_num 的修复内容"
      return
      ;;
  esac
  
  # 执行替换
  sed -i "${line_num}s/.*/$fixed_content/" "$file"
  echo "修复了 $file 第 $line_num 行"
}

# 主程序
FILE="/workspaces/-proxy-worker/worker/src/index.js"

# 检查文件是否存在
if [ ! -f "$FILE" ]; then
  echo "文件不存在: $FILE"
  exit 1
fi

# 创建备份
cp "$FILE" "${FILE}.bak-$(date +%s)"
echo "已创建备份: ${FILE}.bak-$(date +%s)"

# 修复所有已知的问题行
fix_line 282 "$FILE"
fix_line 788 "$FILE"
fix_line 907 "$FILE"
fix_line 955 "$FILE"
fix_line 1020 "$FILE"
fix_line 1045 "$FILE"
fix_line 1108 "$FILE"
fix_line 1114 "$FILE"
fix_line 1121 "$FILE"
fix_line 1147 "$FILE"
fix_line 1151 "$FILE"
fix_line 1178 "$FILE"
fix_line 1183 "$FILE"
fix_line 1263 "$FILE"

echo "修复完成！"
