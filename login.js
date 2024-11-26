// 获取 DOM 元素
const loginBtn = document.getElementById('login-btn');
const loginPopup = document.getElementById('login-popup');
const overlay = document.getElementById('overlay');
const cancelBtn = document.getElementById('cancel-btn');
const loginSubmitBtn = document.getElementById('login-submit');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

// 打开登录弹窗
loginBtn.addEventListener('click', function() {
  loginPopup.style.display = 'block';
  overlay.style.display = 'block';
});

// 关闭登录弹窗
cancelBtn.addEventListener('click', function() {
  loginPopup.style.display = 'none';
  overlay.style.display = 'none';
});

// 点击背景时关闭弹窗
overlay.addEventListener('click', function() {
  loginPopup.style.display = 'none';
  overlay.style.display = 'none';
});

// 登录请求处理
loginSubmitBtn.addEventListener('click', function() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (username && password) {
    // 显示加载状态（可选）
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.textContent = '登录中...';
    const pwd =  btoa(password)

    // 使用axios发起POST请求进行登录
    axios.post('https://restore.msgqu.com/api/v1/login', {
      mobile: username,
      pwd,
    })
    .then(response => {

      const { data } = response;
      console.log('data', data);
      const token = data.data.token.token; // 假设API返回一个token

      // 存储token到localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userInfo',  data.data);

      // 关闭登录弹窗
      loginPopup.style.display = 'none';
      overlay.style.display = 'none';

      // 可以根据需要进行一些操作，比如重定向到其他页面
      console.log('登录成功，Token:', token);

    })
    .catch(error => {
      // 登录失败，显示错误信息
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.textContent = '登录';
      errorMessage.style.display = 'block';
      console.error('登录失败:', error);
    });
  } else {
    alert('请输入用户名和密码');
  }
});
