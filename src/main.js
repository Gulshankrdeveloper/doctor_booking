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
