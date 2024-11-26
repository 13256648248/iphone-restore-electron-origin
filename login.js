// 获取 DOM 元素
const loginBtn = document.getElementById("login-btn");
const loginPopup = document.getElementById("login-popup");
const overlay = document.getElementById("overlay");
const cancelBtn = document.getElementById("cancel-btn");
const loginSubmitBtn = document.getElementById("login-submit");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");

const userAvatar = document.getElementById("user-avatar");
const userInitial = document.getElementById("user-initial");
const logoutMenu = document.querySelector(".logout-menu");
const logoutBtn = document.getElementById("logout-btn");

// 通用方法：显示弹窗
function showPopup(popup, overlay) {
  popup.style.display = "block";
  overlay.style.display = "block";
}

// 通用方法：隐藏弹窗
function hidePopup(popup, overlay) {
  popup.style.display = "none";
  overlay.style.display = "none";
}

// 打开登录弹窗
loginBtn.addEventListener("click", () => showPopup(loginPopup, overlay));

// 关闭登录弹窗
cancelBtn.addEventListener("click", () => hidePopup(loginPopup, overlay));

// 点击背景关闭弹窗
overlay.addEventListener("click", () => hidePopup(loginPopup, overlay));

// 登录请求处理
loginSubmitBtn.addEventListener("click", function () {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (username && password) {
    // 显示加载状态
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.textContent = "登录中...";
    const pwd = btoa(password); 

    axios
      .post("https://restore.msgqu.com/api/v1/login", {
        mobile: username,
        pwd,
      })
      .then((response) => {
        const { data } = response;
        const token = data.data.token.token;

        localStorage.setItem("token", token);
        localStorage.setItem("userInfo", JSON.stringify(data.data));

        // 更新UI
        showUser(data.data.nick_name);
        hidePopup(loginPopup, overlay);
      })
      .catch((error) => {
        // 登录失败处理
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = "登录";
        errorMessage.style.display = "block";
        window.alert("登录失败：" + (error.response?.data?.message || error.message));
      });
  } else {
    window.alert("请输入用户名和密码");
  }
});

// 显示用户信息
function showUser(nickName) {
  const initial = nickName.charAt(0).toUpperCase(); // 获取首字母
  userInitial.textContent = initial;

  // 更新UI
  loginBtn.style.display = "none";
  userAvatar.style.display = "flex";
}

// 检查登录状态
function checkLogin() {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo && userInfo.nick_name) {
      showUser(userInfo.nick_name);
    }
  } catch (error) {
    console.error("解析登录信息失败:", error);
  }
}

// 退出逻辑
logoutBtn.addEventListener("click", () => {
  localStorage.clear(); // 清空存储
  userAvatar.style.display = "none"; // 隐藏用户头像
  loginBtn.style.display = "block"; // 显示登录按钮
  if (logoutMenu) {
    logoutMenu.style.visibility = "hidden"; // 确保隐藏退出菜单
    logoutMenu.style.opacity = "0";
  }
});

// 显示退出菜单
userAvatar.addEventListener('mouseenter', () => {
  logoutMenu.style.visibility = 'visible';
  logoutMenu.style.opacity = '1';
});

// 隐藏退出菜单
userAvatar.addEventListener('mouseleave', () => {
  logoutMenu.style.visibility = 'hidden';
  logoutMenu.style.opacity = '0';
});


// 页面加载时检查登录状态
checkLogin();
