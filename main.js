const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')
const path = require('node:path')
const fs = require("fs");
const { renameBackupFile } = require('./utils')

const plist = require("plist");
const { exec } = require("child_process");

async function handleFileOpen () {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (!canceled) {
    return filePaths[0]
  }
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.loadFile('index.html')
}

async function getDeviceInfo() {
  return new Promise((resolve, reject) => {
    const exePath = path.join(__dirname, "./ios-bin/bin/ideviceinfo.exe");

    console.log("Exe Path:", exec);
    exec(exePath, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing exe: ${error}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      console.log('stdout=====',stdout);
      
      resolve(stdout); // 将 exe 输出返回给前端
    });
  });
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle("get:deviceInfo", getDeviceInfo);
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


// backupTwo2
ipcMain.on("send-unique-device-id", (event, uniqueDeviceID, lang) => {
  console.log("Received UniqueDeviceID:", lang);

  const backup = path.join(__dirname, "./ios-bin/backup/backupTwo");
  // TODO: 判断中英文 选择恢复文件
  const exePath = path.join(__dirname, "./ios-bin/bin/idevicebackup2.exe");
  // 修改文件 uniqueDeviceID
  renameBackupFile(backup, uniqueDeviceID);

  // 执行恢复指令
  // 相当于终端的 PS C:\project\myproject\ios-bin\bin> .\idevicebackup2.exe restore --system --settings C:\project\myproject\ios-bin\backup\backupNoe -d
  return new Promise((resolve, reject) => {
    // 传递给 exe 的参数
    const args = [
      "restore", // 命令
      "--system", // 参数1
      "--settings", // 参数2
      backup, // 备份路径
      "-d", // 参数3
    ];

    // 拼接完整的命令
    const cmd = `"${exePath}" ${args.join(" ")}`;

// 开始执行命令
const process = exec(cmd);

// 监听命令行输出
process.stdout.on("data", (data) => {
  console.log("stdout:", data);
  event.reply("restore-progress", { type: "stdout", message: data });
});

process.stderr.on("data", (data) => {
  console.error("stderr:", data);
  event.reply("restore-progress", { type: "stderr", message: data });
});

process.on("close", (code) => {
  if (code === 0) {
    console.log("Restore completed successfully.");
    event.reply("restore-progress", { type: "complete", message: "恢复完成" });
  } else {
    console.error(`Process exited with code ${code}`);
    event.reply("restore-progress", { type: "error", message: `恢复失败，退出码：${code}` });
  }
});

process.on("error", (error) => {
  console.error("Error during restore process:", error);
  event.reply("restore-progress", { type: "error", message: `执行过程中出错：${error.message}` });
});
  });
});

