// Auth JS - Login & Register

function showLogin() {
  document.getElementById('loginForm').hidden = false;
  document.getElementById('registerForm').hidden = true;
  document.getElementById('loginTab').classList.add('auth-tab--active');
  document.getElementById('registerTab').classList.remove('auth-tab--active');
  clearAuthErrors();
}

function showRegister() {
  document.getElementById('loginForm').hidden = true;
  document.getElementById('registerForm').hidden = false;
  document.getElementById('registerTab').classList.add('auth-tab--active');
  document.getElementById('loginTab').classList.remove('auth-tab--active');
  clearAuthErrors();
}

function togglePassword(inputId, btn) {
  var input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

function clearAuthErrors() {
  var ids = ['loginEmailError','loginPasswordError','regNameError','regEmailError','regPasswordError','regConfirmError'];
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  var alerts = ['loginError','registerError','registerSuccess'];
  alerts.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.hidden = true; el.textContent = ''; }
  });
  document.querySelectorAll('.input.error').forEach(function(el) { el.classList.remove('error'); });
}

function setFieldError(fieldId, msg) {
  var input = document.getElementById(fieldId);
  var err   = document.getElementById(fieldId + 'Error');
  if (input) input.classList.toggle('error', !!msg);
  if (err)   err.textContent = msg || '';
}

function showAlert(id, msg) {
  var el = document.getElementById(id);
  if (el) { el.textContent = msg; el.hidden = false; }
}

// ── Login ─────────────────────────────────────────────────────────────────────

function handleLogin() {
  clearAuthErrors();
  var email    = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value;
  var ok = true;

  if (!email) { setFieldError('loginEmail', 'Email is required.'); ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('loginEmail', 'Enter a valid email.'); ok = false; }
  if (!password) { setFieldError('loginPassword', 'Password is required.'); ok = false; }

  if (!ok) return;

  var btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.textContent = 'Signing in...';

  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: password })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.success) {
      // Save user info in sessionStorage
      sessionStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/index.html';
    } else {
      showAlert('loginError', data.message || 'Invalid email or password.');
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  })
  .catch(function() {
    showAlert('loginError', 'Server error. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  });
}

// ── Register ──────────────────────────────────────────────────────────────────

function handleRegister() {
  clearAuthErrors();
  var name     = document.getElementById('regName').value.trim();
  var email    = document.getElementById('regEmail').value.trim();
  var password = document.getElementById('regPassword').value;
  var confirm  = document.getElementById('regConfirm').value;
  var ok = true;

  if (!name || name.length < 2)    { setFieldError('regName', 'Full name is required (min 2 characters).'); ok = false; }
  if (!email)                      { setFieldError('regEmail', 'Email is required.'); ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('regEmail', 'Enter a valid email.'); ok = false; }
  if (!password || password.length < 6) { setFieldError('regPassword', 'Password must be at least 6 characters.'); ok = false; }
  if (password !== confirm)        { setFieldError('regConfirm', 'Passwords do not match.'); ok = false; }

  if (!ok) return;

  var btn = document.getElementById('registerBtn');
  btn.disabled = true;
  btn.textContent = 'Creating account...';

  fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, email: email, password: password })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.success) {
      showAlert('registerSuccess', 'Account created! You can now sign in.');
      document.getElementById('regName').value = '';
      document.getElementById('regEmail').value = '';
      document.getElementById('regPassword').value = '';
      document.getElementById('regConfirm').value = '';
      setTimeout(showLogin, 2000);
    } else {
      showAlert('registerError', data.message || 'Registration failed.');
    }
    btn.disabled = false;
    btn.textContent = 'Create Account';
  })
  .catch(function() {
    showAlert('registerError', 'Server error. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Create Account';
  });
}

// ── Enter key support ─────────────────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    if (!document.getElementById('loginForm').hidden) handleLogin();
    else handleRegister();
  }
});

// ── Redirect if already logged in ────────────────────────────────────────────
if (sessionStorage.getItem('user')) {
  window.location.href = '/index.html';
}
