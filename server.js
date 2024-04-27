const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8090;

// 检查命令行参数是否提供了 index.html 文件的路径
if (process.argv.length < 3) {
  console.error("Please provide the path to index.html as a command line argument.");
  process.exit(1);
}

const indexHtmlPath = process.argv[2];

// 定义软件包目录路径
const softwareDirectory = path.join(__dirname, "soft");

// 使用 bodyParser 中间件解析 POST 请求的数据
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 存储用户添加的链接的数组
let links = [];

// 添加链接的 POST 请求处理程序
app.post("/add-link", (req, res) => {
  const linkUrl = req.body.url;
  if (linkUrl) {
    links.push(linkUrl);
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

// 获取所有链接的 GET 请求处理程序
app.get("/get-links", (req, res) => {
  res.json(links);
});

// 根路径的路由处理程序，返回软件包列表页面
app.get("/get-software", (req, res) => {
  // 读取软件包目录中的文件列表
  fs.readdir(softwareDirectory, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error("Error reading software directory:", err);
      res.sendStatus(500);
    } else {
      // 将文件名或文件夹名作为下载链接返回给客户端
      const softwareLinks = files.map(file => {
        if (file.isDirectory()) {
          return `<li class="list-group-item folder" data-folder="${file.name}"><a href="/get-folder-content?folder=${encodeURIComponent(file.name)}">${file.name}/</a></li>`; // 为文件夹添加正确的链接
        } else {
          return `<li class="list-group-item"><a href="/soft/${file.name}">${file.name}</a></li>`;
        }
      }).join('');
      // 将链接发送给客户端
      res.send(`<ul class="list-group">${softwareLinks}</ul>`);
    }
  });
});

// 获取文件夹内容的 GET 请求处理程序
app.get("/get-folder-content", (req, res) => {
  const folderName = req.query.folder;
  const maxDepth = req.query.maxDepth ? parseInt(req.query.maxDepth) : -1; // 默认值为-1表示无限制深度

  if (!folderName) {
    res.sendStatus(400);
    return;
  }

  const folderPath = path.join(softwareDirectory, folderName);
  recursiveRead(folderPath, maxDepth)
    .then(folderContent => {
      res.send(`<ul class="list-group">${folderContent}</ul>`);
    })
    .catch(err => {
      console.error("Error reading folder:", err);
      res.sendStatus(500);
    });
});

// 递归读取文件夹内容
function recursiveRead(folderPath, maxDepth) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        reject(err);
      } else {
        let folderContent = '';
        for (const file of files) {
          const filePath = path.join(folderPath, file.name);
          if (file.isDirectory() && (maxDepth === -1 || maxDepth > 0)) {
            folderContent += `<li class="list-group-item folder" data-folder="${file.name}"><a href="/get-folder-content?folder=${encodeURIComponent(path.relative(softwareDirectory, filePath))}&maxDepth=${maxDepth === -1 ? -1 : maxDepth - 1}">${file.name}/</a></li>`;
          } else if (file.isFile()) {
            folderContent += `<li class="list-group-item"><a href="/soft/${path.relative(softwareDirectory, filePath)}">${file.name}</a></li>`;
          }
        }
        resolve(folderContent);
      }
    });
  });
}

// 创建文件夹的 POST 请求处理程序
app.post("/create-folder", (req, res) => {
  const folderName = req.body.folderName;
  if (folderName) {
    const folderPath = path.join(softwareDirectory, folderName); // 使用正确的路径
    fs.mkdir(folderPath, { recursive: true }, (err) => {
      if (err) {
        console.error("Error creating folder:", err);
        res.sendStatus(500);
      } else {
        console.log("Folder created:", folderName);
        res.sendStatus(200);
      }
    });
  } else {
    res.sendStatus(400);
  }
});

// 上传文件的 POST 请求处理程序
app.post("/upload-file", (req, res) => {
  // 处理文件上传，这里根据具体情况实现
  // 可以使用第三方库如 multer 来处理文件上传
  // 上传的文件会保存到软件包目录下的对应文件夹中
  // 这里只是简单的示例，你需要根据实际情况来处理文件上传
  console.log("Received file:", req.file);
  res.sendStatus(200);
});

// 静态文件目录，用于提供软件包下载
app.use("/soft", express.static(softwareDirectory, { index: false }));

// 根路径的路由处理程序，返回软件包列表页面
app.get("/", (req, res) => {
  // 读取并发送 HTML 文件内容
  fs.readFile(indexHtmlPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading HTML file:", err);
      res.sendStatus(500);
    } else {
      res.send(data);
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
