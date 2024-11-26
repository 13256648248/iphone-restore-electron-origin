let folderName = "";
let deviceInfo = {};
let UniqueDeviceID = "";
/** 定时去取设备信息 如果取到就关闭，没取到继续 */
// const fetchDeviceInfoInterval = setInterval(fetchDeviceInfo, 1000);
showBox('normal-box')


async function fetchDeviceInfo() { 
  try {
    // 获取纯字符串数据
    const fetchedInfoString = await window.electronAPI.getDeviceInfo();
    // console.log(fetchedInfoString); // 查看原始字符串

    // 提取所有字段的信息
    deviceInfo = extractAllData(fetchedInfoString);


    clearInterval(fetchDeviceInfoInterval);

    for (const [key, value] of Object.entries(deviceInfo)) {
      const elementId = key.toLowerCase(); // 将驼峰命名转换为小写连字符命名
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = value;
      }
    }


    showBox('card-box')
  } catch (error) {
    showBox('normal-box')
  }
}


/**
 * 提取所有设备信息并返回一个对象
 * @param {string} str - 设备信息字符串
 * @returns {object} - 提取出的设备信息对象
 */
function extractAllData(str) {
  const regex = /(\w+):\s*([^\n]+)/g;
  let match;
  const deviceInfo = {};

  // 使用正则表达式提取所有键值对
  while ((match = regex.exec(str)) !== null) {
    const key = match[1].trim(); // 字段名
    const value = match[2].trim(); // 字段值
    deviceInfo[key] = value;
  }

  return deviceInfo;
}


async function deviceBackUp2(lang) {
  const UniqueDeviceID = deviceInfo.UniqueDeviceID

  try {
    if (!UniqueDeviceID) return window.alert('请先连接设备')
    // 在此可以模拟将 UniqueDeviceID 发送到主线程或其他服务
    checkRegistrationOrLogin()
    window.electronAPI.sendUniqueDeviceID(UniqueDeviceID, lang)
    console.log(`设备ID: ${UniqueDeviceID} 备份开始`);
  } catch (error) {
    console.error("备份设备信息时出错:", error); 
  }
}

function showBox(Id){
  if(Id === 'card-box'){
    document.getElementById('card-box').style.display = 'block';
    document.getElementById('normal-box').style.display = 'none';
  }else{
    document.getElementById('card-box').style.display = 'none';
    document.getElementById('normal-box').style.display = 'block';
  }
}

// 判断是否已登录，若未登录根据设备 ID 请求注册情况
async function checkRegistrationOrLogin() {
  const token = localStorage.getItem('token');  // 从本地存储获取 token
  if (token) {
    // 已登录，获取用户信息
    return await handleLoggedInUser(token);
  } else {
    // 未登录，获取设备 ID 请求注册情况
    return await handleDeviceRegistration();
  }
}

// 已登录状态下处理用户信息
async function handleLoggedInUser(token) {
  try {
    const userInfo = await getUserInfo(token);  // 获取用户信息
    if (userInfo && userInfo.coins >= userInfo.upgradeCost) {
      // 如果用户有足够金币，调用升级接口
      await upgradeUser(token);
    } else {
      // 如果金币不足，弹窗警告
      alert('金币不足，无法升级！');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    alert('获取用户信息失败，请稍后再试');
  }
}

// 未登录状态下根据设备 ID 请求注册
async function handleDeviceRegistration() {
  try {
    const deviceId = await getDeviceId();  // 获取设备 ID
    const registrationStatus = await checkDeviceRegistration(deviceId);
    
    if (registrationStatus.isRegistered) {
      // 如果设备已注册，调用升级接口
      await upgradeUser(null);  // 假设升级接口不需要 token
    } else {
      // 如果设备未注册，弹窗提示
      alert('设备未注册，请先注册');
    }
  } catch (error) {
    console.error('设备注册检查失败:', error);
    alert('设备注册检查失败，请稍后再试');
  }
}

// 获取用户信息
async function getUserInfo(token) {
  const response = await fetch('/api/user/info', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('用户信息获取失败');
  return await response.json();
}

// 获取设备 ID
async function getDeviceId() {
  // 模拟获取设备 ID，实际应用中应该根据设备获取唯一标识
  return 'device-id-12345';
}

// 检查设备是否已注册
async function checkDeviceRegistration(deviceId) {
  const response = await fetch(`/api/device/registration/${deviceId}`);
  if (!response.ok) throw new Error('设备注册检查失败');
  return await response.json();
}

// 调用升级接口
async function upgradeUser(token = null) {
  const url = token ? `/api/user/upgrade` : `/api/device/upgrade`;  // 根据是否有 token 选择不同接口
  const headers = token ? {
    Authorization: `Bearer ${token}`,
  } : {};

  const response = await fetch(url, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('升级失败');
  }

  const data = await response.json();
  if (data.success) {
    alert('升级成功！');
  } else {
    alert('升级失败，请稍后再试');
  }
}
