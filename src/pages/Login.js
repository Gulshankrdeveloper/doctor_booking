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
    <div style="display: grid; grid-template-columns: 1.2fr 1fr; min-height: 100vh; overflow: hidden;">
      
      <!-- HERO IMAGE / LEFT -->
      <div style="position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; padding: 4rem; min-height: 35vh;">
         <img src="/login-bg.png" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;" alt="Hospital Interior">
         <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(11,17,32,1) 0%, rgba(11,17,32,0.4) 40%, rgba(11,17,32,0.1) 100%); z-index: 1;"></div>
         
         <!-- Animated Floating Text -->
         <div style="position: relative; z-index: 2;" class="fade-in delay-200">
           <h1 style="font-size: 3.5rem; margin-bottom: 1rem; color: white; line-height: 1.15;">
             Step into the <br><span class="text-gradient">future</span> of healthcare.
           </h1>
           <p style="font-size: 1.3rem; color: rgba(255,255,255,0.8); max-width: 450px;">
             Join thousands of patients and top-tier doctors managing their lives on a single, unified digital platform.
           </p>
         </div>
         
         <!-- Decorative Orbs -->
         <div style="position: absolute; top: 20%; right: 20%; width: 300px; height: 300px; background: var(--primary); border-radius: 50%; filter: blur(100px); opacity: 0.3; z-index: 0; pointer-events: none;"></div>
         <div style="position: absolute; bottom: -10%; left: -10%; width: 400px; height: 400px; background: var(--accent); border-radius: 50%; filter: blur(120px); opacity: 0.2; z-index: 0; pointer-events: none;"></div>
      </div>

      <!-- AUTH FORM / RIGHT -->
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem; background: var(--bg-color);">
        <a href="/" class="logo fade-in delay-100" data-link style="margin-bottom: 2rem;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gradient"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          <span style="font-size: 1.8rem;">NexHealth</span>
        </a>

        <div class="glass-card fade-in delay-300" style="width: 100%; max-width: 420px; padding: 2rem; background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 id="auth-title" style="margin-bottom: 0.5rem; font-size: 1.5rem;">Welcome back</h2>
            <p style="color: var(--text-secondary); font-size: 0.85rem;">Please enter your credentials to access your dashboard.</p>
          </div>

          <!-- LOGIN FORM -->
          <div id="login-form-container">
            <form onsubmit="event.preventDefault(); window.handleFirebaseLogin();" style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div class="input-group" style="margin: 0;">
                 <label style="font-size: 0.85rem; color: var(--text-secondary);">Email Address</label>
                 <input id="login-email" type="email" class="input-glass" placeholder="you@example.com" required>
              </div>
              <div class="input-group" style="margin: 0;">
                 <label style="font-size: 0.85rem; color: var(--text-secondary);">Secure Password</label>
                 <input id="login-pass" type="password" class="input-glass" placeholder="••••••••" required>
              </div>
              <p id="login-msg" style="color: var(--danger); font-size: 0.8rem; min-height: 1rem; margin: -0.5rem 0 0 0;"></p>
              
              <button id="login-btn" type="submit" class="btn btn-primary" style="margin-top: 0.5rem; padding: 0.85rem; font-size: 1rem;">Log In to Portal</button>
              
              <p style="text-align: center; font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
                 New patient? <a href="#" onclick="window.toggleAuthMode(); event.preventDefault();" class="text-gradient" style="font-weight: 600;">Sign up here</a>
              </p>
            </form>
          </div>

          <!-- PATIENT SIGNUP FORM -->
          <div id="signup-form-container" style="display: none;">
            <form onsubmit="event.preventDefault(); window.handlePatientSignup();" style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div class="input-group" style="margin: 0;">
                 <label style="font-size: 0.85rem; color: var(--text-secondary);">Full Name</label>
                 <input id="signup-name" type="text" class="input-glass" placeholder="Alex Rivera" required>
              </div>
              <div class="input-group" style="margin: 0;">
                 <label style="font-size: 0.85rem; color: var(--text-secondary);">Email Address</label>
                 <input id="signup-email" type="email" class="input-glass" placeholder="you@example.com" required>
              </div>
              <div class="input-group" style="margin: 0;">
                 <label style="font-size: 0.85rem; color: var(--text-secondary);">Secure Password (Min 6 chars)</label>
                 <input id="signup-pass" type="password" class="input-glass" placeholder="••••••••" required minlength="6">
              </div>
              <p id="signup-msg" style="color: var(--danger); font-size: 0.8rem; min-height: 1rem; margin: -0.5rem 0 0 0;"></p>
              
              <button id="signup-btn" type="submit" class="btn btn-primary" style="margin-top: 0.5rem; padding: 0.85rem; font-size: 1rem;">Register Account</button>
              
              <p style="text-align: center; font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
                 Already registered? <a href="#" onclick="window.toggleAuthMode(); event.preventDefault();" class="text-gradient" style="font-weight: 600;">Log In here</a>
              </p>
            </form>
          </div>
          
          <!-- DOCTOR PARTNERSHIP CALLOUT -->
          <div style="text-align: center; margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;">
             <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.75rem;">Are you a medical professional?</p>
             <a href="/register-doctor" data-link class="btn btn-outline" style="width: 100%; border-color: rgba(16, 185, 129, 0.5); color: #34d399; font-size: 0.9rem;">
                Partner with us (Doctor Registration)
             </a>
          </div>
          
        </div>
      </div>
    </div>
  `;
};
