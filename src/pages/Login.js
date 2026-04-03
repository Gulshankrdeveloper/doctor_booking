import { authService } from '../auth.js';
import { navigateTo } from '../main.js';

export const renderLogin = () => {
  // Expose login logic to global scope so HTML string forms can trigger it
  window.handleFirebaseLogin = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const btn = document.getElementById('login-btn');
    const msg = document.getElementById('login-msg');
    
    if(!email || !pass) return;

    btn.innerText = "Authenticating...";
    btn.disabled = true;
    msg.innerText = "";
    
    try {
      const role = await authService.login(email, pass);
      if (role === 'doctor') navigateTo('/doctor');
      else navigateTo('/patient');
    } catch (e) {
      msg.innerText = "Error: Invalid Credentials";
      btn.innerText = "Log In";
      btn.disabled = false;
    }
  };

  window.handlePatientSignup = async () => {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-pass').value;
    const btn = document.getElementById('signup-btn');
    const msg = document.getElementById('signup-msg');
    
    if(!email || !pass || !name) return;

    btn.innerText = "Registering...";
    btn.disabled = true;
    msg.innerText = "";
    
    try {
      await authService.registerPatient(email, pass, name);
      navigateTo('/patient');
    } catch (e) {
      msg.innerText = "Error: " + e.message;
      btn.innerText = "Sign Up";
      btn.disabled = false;
    }
  };

  window.toggleAuthMode = () => {
    const isLogin = document.getElementById('login-form-container').style.display !== 'none';
    if(isLogin) {
       document.getElementById('login-form-container').style.display = 'none';
       document.getElementById('signup-form-container').style.display = 'block';
       document.getElementById('auth-title').innerText = "Create Patient Account";
    } else {
       document.getElementById('login-form-container').style.display = 'block';
       document.getElementById('signup-form-container').style.display = 'none';
       document.getElementById('auth-title').innerText = "Welcome back";
    }
  };

  return `
    <div class="container fade-in" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh;">
      <a href="/" class="logo" data-link style="margin-bottom: 2rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gradient"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        NexHealth
      </a>

      <div class="glass-card" style="width: 100%; max-width: 400px; position: relative; overflow: hidden;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h2 id="auth-title" style="margin-bottom: 0.5rem;">Welcome back</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Please enter your credentials to access your dashboard.</p>
        </div>

        <!-- LOGIN FORM -->
        <div id="login-form-container">
          <form onsubmit="event.preventDefault(); window.handleFirebaseLogin();" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="input-group">
               <label style="font-size: 0.85rem; color: var(--text-secondary);">Email</label>
               <input id="login-email" type="email" class="input-glass" placeholder="you@example.com" required>
            </div>
            <div class="input-group">
               <label style="font-size: 0.85rem; color: var(--text-secondary);">Password</label>
               <input id="login-pass" type="password" class="input-glass" placeholder="••••••••" required>
            </div>
            <p id="login-msg" style="color: var(--danger); font-size: 0.8rem; height: 1rem; margin: 0;"></p>
            <button id="login-btn" type="submit" class="btn btn-primary" style="margin-top: 0.5rem;">Log In</button>
            <p style="text-align: center; font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem;">
               New patient? <a href="#" onclick="window.toggleAuthMode(); event.preventDefault();" class="text-gradient">Sign up here</a>
            </p>
          </form>
        </div>

        <!-- PATIENT SIGNUP FORM -->
        <div id="signup-form-container" style="display: none;">
          <form onsubmit="event.preventDefault(); window.handlePatientSignup();" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="input-group">
               <label style="font-size: 0.85rem; color: var(--text-secondary);">Full Name</label>
               <input id="signup-name" type="text" class="input-glass" placeholder="Alex Rivera" required>
            </div>
            <div class="input-group">
               <label style="font-size: 0.85rem; color: var(--text-secondary);">Email</label>
               <input id="signup-email" type="email" class="input-glass" placeholder="you@example.com" required>
            </div>
            <div class="input-group">
               <label style="font-size: 0.85rem; color: var(--text-secondary);">Password (Min 6 chars)</label>
               <input id="signup-pass" type="password" class="input-glass" placeholder="••••••••" required minlength="6">
            </div>
            <p id="signup-msg" style="color: var(--danger); font-size: 0.8rem; height: 1rem; margin: 0;"></p>
            <button id="signup-btn" type="submit" class="btn btn-primary" style="margin-top: 0.5rem;">Register Account</button>
            <p style="text-align: center; font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem;">
               Already registered? <a href="#" onclick="window.toggleAuthMode(); event.preventDefault();" class="text-gradient">Log In</a>
            </p>
          </form>
        </div>
        
        <div style="text-align: center; margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;">
           <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem;">Are you a medical professional?</p>
           <a href="/register-doctor" data-link class="btn btn-outline" style="width: 100%; border-color: var(--accent); color: var(--accent);">Partner with us (Doctor Registration)</a>
        </div>
      </div>
    </div>
  `;
};
