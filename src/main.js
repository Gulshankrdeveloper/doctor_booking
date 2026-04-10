import './style.css'
import { renderLanding } from './pages/Landing.js'
import { renderPatientDashboard } from './pages/PatientDashboard.js'
import { renderDoctorDashboard } from './pages/DoctorDashboard.js'
import { renderLogin } from './pages/Login.js'
import { renderRegisterDoctor } from './pages/RegisterDoctor.js'
import { renderRoom } from './pages/Room.js'
import { fakeAuth } from './auth.js'

const app = document.querySelector('#app')

// Simple client-side router
export const navigateTo = (path) => {
  window.history.pushState({}, path, window.location.origin + path)
  router()
}

// Attach logout to window for easy clicking in HTML strings
window.handleLogout = () => {
  fakeAuth.logout();
};

// Global Toast Notification Engine
window.showToast = (message, type = 'info') => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'; // info
  if (type === 'success') icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
  if (type === 'error') icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  
  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove());
  }, 4000);
};

const routes = {
  '/': renderLanding,
  '/login': renderLogin,
  '/register-doctor': renderRegisterDoctor,
  '/patient': renderPatientDashboard,
  '/doctor': renderDoctorDashboard,
  '/room': renderRoom
}

const router = () => {
  const path = window.location.pathname
  
  // Route Guards
  if (!fakeAuth.isAuthenticated() && (path === '/patient' || path === '/doctor' || path === '/room')) {
    navigateTo('/login');
    return;
  }
  if (path === '/patient' && fakeAuth.getRole() !== 'patient') {
    navigateTo('/login');
    return;
  }
  if (path === '/doctor' && fakeAuth.getRole() !== 'doctor') {
    navigateTo('/login');
    return;
  }
  
  // Redirect away from login if already authenticated
  if (path === '/login' && fakeAuth.isAuthenticated()) {
    const role = fakeAuth.getRole();
    navigateTo(role === 'patient' ? '/patient' : '/doctor');
    return;
  }

  const renderFunction = routes[path] || renderLanding
  
  // Render layout and content
  app.innerHTML = `
    <div class="bg-blobs">
      <div class="blob primary"></div>
      <div class="blob accent"></div>
    </div>
    ${renderFunction()}
  `
}

// Global click delegation for fast SPA routing
document.body.addEventListener('click', e => {
  const link = e.target.closest('[data-link]');
  if (link) {
    e.preventDefault();
    navigateTo(link.getAttribute('href'));
  }
});

// Handle browser back/forward arrows
window.addEventListener('popstate', router)

// Rerender when auth state changes
window.addEventListener('authChange', router)

// Run router on initial load
document.addEventListener('DOMContentLoaded', () => {
  router()
})
