let deviceInfo = {};
const BasicCost = 5;
/** 定时去取设备信息 如果取到就关闭，没取到继续 */
// const fetchDeviceInfoInterval = setInterval(fetchDeviceInfo, 1000);

/** 定时去取设备信息，如果取到就显示卡片盒子，没取到继续尝试 */
async function fetchDeviceInfo() {
  try {
    const fetchedInfoString = await window.electronAPI.getDeviceInfo(); // 获取纯字符串数据
    deviceInfo = extractAllData(fetchedInfoString); // 提取所有字段信息

    clearInterval(fetchDeviceInfoInterval);
    // 更新 UI
    updateDeviceInfoUI(deviceInfo);
    showBox('card-box'); // 切换到卡片盒子视图
  } catch (error) {
    console.error('获取设备信息失败:', error);
    showBox('normal-box'); // 切换到默认盒子视图
  }
}

/**
 * 根据设备信息更新页面中的内容
 * @param {Object} deviceInfo - 设备信息对象
 */
function updateDeviceInfoUI(deviceInfo) {
  for (const [key, value] of Object.entries(deviceInfo)) {
    const elementId = key.toLowerCase(); // 将驼峰命名转换为小写连字符
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
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

/**
 * 备份设备信息，检查登录状态或设备注册状态
 */
async function deviceBackup(lang) {
  const uniqueDeviceID = deviceInfo.UniqueDeviceID;

  // if (!uniqueDeviceID) {
  //   return alert('请先连接设备');
  // }

  try {
    await checkRegistrationOrLogin(lang);
  } catch (error) {
    console.error('备份设备信息时出错:', error);
  }
}

/**
 * 检查登录状态，执行相应逻辑
 */
async function checkRegistrationOrLogin(lang) {
  const token = localStorage.getItem('token'); // 从本地存储获取 token

  if (token) {
    // 已登录，处理用户信息
    await handleLoggedInUser(token);
  } else {
    // 未登录，检查设备注册情况
    await handleDeviceRegistration(lang);
  }
}

/**
 * 已登录用户的处理逻辑
 * @param {string} token - 登录的用户 token
 */
async function handleLoggedInUser(token) {
  try {
    const userInfo = await getUserInfo(token);

    if (userInfo.data.coin >= BasicCost) {
      await upgradeUser(token);
    } else {
      alert('金币不足，无法升级！');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    alert('获取用户信息失败，请稍后再试');
  }
}

/**
 * 未登录状态下根据设备 ID 检查注册情况
 */
async function handleDeviceRegistration(lang) {
  const uniqueDeviceID = deviceInfo.UniqueDeviceID;

  try {
    const registrationStatus = await checkDeviceRegistration(uniqueDeviceID);

    if (registrationStatus.isRegistered) {
      await upgradeUser(null, lang); // 假设升级接口不需要 token
    } else {
      alert('设备未注册，请先注册');
    }
  } catch (error) {
    console.error('设备注册检查失败:', error);
    alert('设备注册检查失败，请稍后再试');
  }
}

/**
 * 获取用户信息
 * @param {string} token - 登录的用户 token
 */
async function getUserInfo(token) {


  const response = await axios.get('https://restore.msgqu.com/api/v1/user/info', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('response', response);
  
  if (response.status !== 200 || response.data.code !== 0 ) throw new Error('用户信息获取失败');
  return  response.data;
}

/**
 * 检查设备是否已注册
 * @param {string} deviceId - 设备 ID
 */
async function checkDeviceRegistration(deviceId) {
  const response = await fetch(`/api/device/registration/${deviceId}`);
  if (!response.ok) throw new Error('设备注册检查失败');
  return await response.json();
}

/**
 * 调用升级接口
 * @param {string|null} token - 用户 token，可选
 * @param {string} lang - 语言参数
 */
async function upgradeUser(token = null, lang) {
  const uniqueDeviceID = deviceInfo.UniqueDeviceID;

  window.electronAPI.sendUniqueDeviceID(uniqueDeviceID, lang);
  console.log(`设备ID: ${uniqueDeviceID} 备份开始`);
}

showBox('normal-box'); 
/**
 * 切换显示的盒子
 * @param {string} id - 盒子的 ID
 */
function showBox(Id){
  if(Id === 'card-box'){
    document.getElementById('card-box').style.display = 'block';
    document.getElementById('normal-box').style.display = 'none';
  }else{
    document.getElementById('card-box').style.display = 'none';
    document.getElementById('normal-box').style.display = 'block';
  }
}