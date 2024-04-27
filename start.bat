@echo off

rem 检查是否提供了 index.html 文件的路径作为参数
if "%~1"=="" (
  echo Please provide the path to index.html as an argument.
  exit /b 1
)

rem 启动 Node.js 服务器，并将 index.html 文件的路径作为参数传递
node server.js %1
