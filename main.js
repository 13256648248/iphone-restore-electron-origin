const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')
const path = require('node:path')
const fs = require("fs");

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
    const exePath = path.join(__dirname, "../ios-bin/bin/ideviceinfo.exe");

    console.log("Exe Path:", exePath);
    exec(exePath, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing exe: ${error}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
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
ipcMain.on("send-unique-device-id", (event, uniqueDeviceID) => {
  console.log("Received UniqueDeviceID:", uniqueDeviceID);

  const backup = path.join(__dirname, "./ios-bin/backup/backupTwo");
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

    // 执行命令
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing exe: ${error}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout); // 返回命令执行的输出
    });
  });
});

// 重命名 backup 目录下的文件
async function renameBackupFile(PATH, uniqueDeviceID) {
  try {
    const files = await fs.promises.readdir(PATH); // 使用 promises API
    const filteredFiles = files.filter((file) => file !== ".DS_Store");

    // 确保 backup 目录下只有一个文件
    if (filteredFiles.length === 1) {
      const oldFilePath = path.join(PATH, filteredFiles[0]);
      const oldFilePathInfo = path.join(PATH, filteredFiles[0], "info.plist");
      const newFilePath = path.join(PATH, uniqueDeviceID);

      // 等待修改 Info.plist 文件完成
      await modifyPlistFile(oldFilePathInfo, uniqueDeviceID);

      // 修改完成后才重命名文件
      await fs.promises.rename(oldFilePath, newFilePath);
      console.log(`File renamed to: ${newFilePath}`);
    } else {
      console.error(
        "The backup directory should contain exactly one file (excluding .DS_Store)."
      );
    }
  } catch (err) {
    console.error("Failed to rename backup file:", err);
  }
}

/**
 * 修改 Info.plist 中的 Target Identifier 和 Unique Identifier 为 uniqueDeviceID
 * @param {string} infoPlistPath 要修改的 Info.plist 文件路径
 * @param {string} uniqueDeviceID 要修改的值
 */
function modifyPlistFile(infoPlistPath, uniqueDeviceID) {
  return new Promise((resolve, reject) => {
    fs.readFile(infoPlistPath, "utf8", (err, data) => {
      if (err) {
        reject("Failed to read Info.plist: " + err);
        return;
      }

      try {
        // 解析 plist 文件
        let plistData = plist.parse(data);

        // 修改 Target Identifier 和 Unique Identifier
        if (plistData["Target Identifier"]) {
          plistData["Target Identifier"] = uniqueDeviceID;
        }
        if (plistData["Unique Identifier"]) {
          plistData["Unique Identifier"] = uniqueDeviceID;
        } else {
          // 如果不存在 Unique Identifier，则新增它
          plistData["Unique Identifier"] = uniqueDeviceID;
        }

        // 保持原有的其他字段不变，只有需要修改的部分被更新
        const updatedPlist = plist.build(plistData);

        // 写回修改后的内容到 Info.plist 文件
        fs.writeFile(infoPlistPath, updatedPlist, "utf8", (writeErr) => {
          if (writeErr) {
            reject("Failed to write updated Info.plist: " + writeErr);
            return;
          }
          console.log("Info.plist has been updated.");
          resolve();  // 成功完成后 resolve
        });
      } catch (parseErr) {
        reject("Failed to parse Info.plist: " + parseErr);
      }
    });
  });
}
