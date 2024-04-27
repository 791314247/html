#!/bin/bash

# 检查是否提供了 index.html 文件的路径作为参数
if [ $# -eq 0 ]; then
  echo "Please provide the path to index.html as an argument."
  exit 1
fi

# 获取 index.html 文件的路径
index_html_path=$1

# 启动 Node.js 服务器，并将 index.html 文件的路径作为参数传递
node server.js "$index_html_path"
