let folderName = "";
let deviceInfo = {};
let UniqueDeviceID = "";

async function fetchDeviceInfo() {
  try {
    // 获取纯字符串数据
    const fetchedInfoString = await window.electronAPI.getDeviceInfo()
    console.log(fetchedInfoString); // 查看原始字符串

    // 提取各个字段的信息
    deviceInfo = {
      activationState: extractData(fetchedInfoString, /ActivationState:\s*(\w+)/),
      firmwareVersion: extractData(fetchedInfoString, /FirmwareVersion:\s*([^\s]+)/),
      deviceName: extractData(fetchedInfoString, /DeviceName:\s*([^\s]+)/),
      serialNumber: extractData(fetchedInfoString, /SerialNumber:\s*([^\s]+)/),
      modelNumber: extractData(fetchedInfoString, /ModelNumber:\s*([^\s]+)/),
      productType: extractData(fetchedInfoString, /ProductType:\s*([^\s]+)/),
      wifiAddress: extractData(fetchedInfoString, /WiFiAddress:\s*([^\s]+)/),
      bluetoothAddress: extractData(fetchedInfoString, /BluetoothAddress:\s*([^\s]+)/),
      regionInfo: extractData(fetchedInfoString, /RegionInfo:\s*([^\s]+)/),
      simStatus: extractData(fetchedInfoString, /SIMStatus:\s*([^\s]+)/),
      icloudStatus: extractData(fetchedInfoString, /iCloudStatus:\s*([^\s]+)/),
    };
    UniqueDeviceID = extractData(fetchedInfoString, /UniqueDeviceID:\s*([^\s]+)/);

    // 更新 DOM 显示信息
    document.getElementById("deviceName").textContent = deviceInfo.deviceName;
    document.getElementById("firmwareVersion").textContent = deviceInfo.firmwareVersion;
    document.getElementById("activationState").textContent = deviceInfo.activationState;
    document.getElementById("serialNumber").textContent = deviceInfo.serialNumber;
    document.getElementById("modelNumber").textContent = deviceInfo.modelNumber;
    document.getElementById("productType").textContent = deviceInfo.productType;
    document.getElementById("wifiAddress").textContent = deviceInfo.wifiAddress;
    document.getElementById("bluetoothAddress").textContent = deviceInfo.bluetoothAddress;
    document.getElementById("regionInfo").textContent = deviceInfo.regionInfo;
    document.getElementById("simStatus").textContent = deviceInfo.simStatus;
    document.getElementById("icloudStatus").textContent = deviceInfo.icloudStatus;
    document.getElementById("uniqueDeviceID").textContent = UniqueDeviceID;

    // 显示设备信息部分
    document.getElementById("deviceInfoSection").style.display = "block";
  } catch (error) {
    console.error("Failed to fetch device info:", error);
  }
}

function extractData(str, regex) {
  const match = str.match(regex);
  return match ? match[1] : "未知"; // 如果没有匹配项，返回 '未知'
}

async function selectFolder() {
  try {
    const filePath = await window.electronAPI.openFile()
    folderName = filePath || "未选择文件夹";
    document.getElementById("folderName").textContent = `选中的文件夹: ${folderName}`;
  } catch (error) {
    console.error("选择文件夹时出错:", error);
  }
}

async function deviceBackUp2() {
  try {
    if (!UniqueDeviceID) return;
    // 在此可以模拟将 UniqueDeviceID 发送到主线程或其他服务
    window.electronAPI.sendUniqueDeviceID(UniqueDeviceID)
    console.log(`设备ID: ${UniqueDeviceID} 备份开始`);
  } catch (error) {
    console.error("备份设备信息时出错:", error);
  }
}

