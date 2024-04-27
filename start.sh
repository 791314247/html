#!/bin/bash

# 在 /etc/crontabs/root 文件中添加以下行：
# 每天 6 点执行脚本
# 0 6 * * * /etc/adguardhomeupdate.sh

# 用户添加的URL和对应的目标文件路径
URLS=(
    "https://raw.githubusercontent.com/791314247/html/main/home.html ./home.html"
	  "https://raw.githubusercontent.com/791314247/html/main/server.js ./server.js"
	  "https://raw.githubusercontent.com/791314247/html/main/gongsi-index.html ./gongsi-index.html"
	  "https://raw.githubusercontent.com/791314247/html/main/gongsi-index-root.html ./gongsi-index-root.html"
    # 添加更多URL和目标文件路径...
)

# 遍历用户添加的URL和对应的目标文件路径
for entry in "${URLS[@]}"; do
    # 使用空格分隔URL和目标文件路径
    IFS=' ' read -r url target_file <<< "$entry"
    
    # 使用 curl 下载文件，并将错误输出重定向到临时文件
    curl_output=$(curl -fsSL "$url" 2>/tmp/curl_error.log)

    # 检查 curl 是否执行成功
    if [ $? -ne 0 ]; then
        echo "Error: Failed to download file from $url. Curl error: $(cat /tmp/curl_error.log)"
        continue
    fi

    # 检查下载的内容是否为空
    if [ -z "$curl_output" ]; then
        echo "Error: Downloaded file from $url is empty"
        continue
    fi

    # 将下载的内容写入目标文件
    echo "$curl_output" > "$target_file"

    # 检查写入是否成功
    if [ $? -ne 0 ]; then
        echo "Error: Failed to write content to $target_file"
        continue
    fi

    echo "$target_file updated successfully"
done

# 检查是否提供了 index.html 文件的路径作为参数
if [ $# -eq 0 ]; then
  echo "Please provide the path to index.html as an argument."
  exit 1
fi

# 获取 index.html 文件的路径
index_html_path=$1

# 启动 Node.js 服务器，并将 index.html 文件的路径作为参数传递
node server.js "$index_html_path" &
