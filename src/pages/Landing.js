import { fakeAuth } from '../auth.js';

export const renderLanding = () => {
  const isAuth = fakeAuth.isAuthenticated();
  const role = fakeAuth.getRole();

  let authButtons = `<a href="/login" class="btn btn-primary" data-link>Book Appointment / Sign In</a>`;
  let navItems = `
      <a href="/" class="active" data-link>Home</a>
      <a href="/login" data-link>Services</a>
  `;
  
  if (isAuth && role === 'patient') {
      authButtons = `
         <a href="/patient" class="btn btn-primary" style="margin-right: 1rem;" data-link>My Portal</a>
         <button onclick="window.handleLogout()" class="btn btn-outline">Logout</button>
      `;
      navItems = `
          <a href="/" class="active" data-link>Home</a>
          <a href="/patient" data-link>My Dashboard</a>
      `;
  } else if (isAuth && role === 'doctor') {
      authButtons = `
         <a href="/doctor" class="btn btn-accent" style="margin-right: 1rem;" data-link>Doctor Terminal</a>
         <button onclick="window.handleLogout()" class="btn btn-outline">Logout</button>
      `;
      navItems = `
          <a href="/" class="active" data-link>Home</a>
          <a href="/doctor" data-link>Pro Settings</a>
      `;
  }

  return `
    <div class="container fade-in">
      <nav class="navbar">
        <a href="/" class="logo" data-link>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gradient"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          NexHealth
        </a>
        <div class="nav-links">
          ${navItems}
        </div>
        <div>
          ${authButtons}
        </div>
      </nav>

      <main style="margin-top: 4rem; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
        <div class="hero-content">
          <h1 style="font-size: 3.5rem; margin-bottom: 1.5rem;">
            Find & Consult <br>
            <span class="text-gradient">Top Doctors</span>.
          </h1>
          <p style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 2rem;">
            Skip the waiting room with secure online video consultations, or book an in-person clinic visit instantly. Healthcare on your terms.
          </p>
          
          <div class="glass-card fade-in delay-200" style="padding: 1rem;">
            <form style="display: flex; gap: 1rem; flex-wrap: wrap;" onsubmit="event.preventDefault(); window.history.pushState({}, '', '/patient'); window.dispatchEvent(new Event('popstate'));">
              <input type="text" class="input-glass" placeholder="Search specialist..." style="flex: 1; min-width: 200px; margin: 0;">
              
              <select class="input-glass" style="width: 150px; appearance: none; background-color: rgba(0,0,0,0.5);">
                <option value="any">Any Format</option>
                <option value="online">Online (Video)</option>
                <option value="offline" selected>In-Person (Clinic)</option>
              </select>

              <input type="text" class="input-glass" placeholder="Zip/City" style="width: 120px; margin: 0;">
              <button type="submit" class="btn btn-primary" style="flex-grow: 1;">Search</button>
            </form>
          </div>

          <div style="margin-top: 3rem; display: flex; gap: 2rem; color: var(--text-secondary);">
            <div><strong style="color: white; font-size: 1.5rem;">Online</strong><br>Consultations</div>
            <div><strong style="color: white; font-size: 1.5rem;">Offline</strong><br>Clinic Visits</div>
            <div><strong style="color: white; font-size: 1.5rem;">4.9/5</strong><br>Average Rating</div>
          </div>
        </div>

        <div class="hero-visual fade-in delay-300" style="position: relative;">
          <div class="glass-panel" style="aspect-ratio: 4/3; padding: 2rem; display: flex; flex-direction: column; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                  <h3 style="font-size: 1.25rem;">Live Consultation</h3>
                  <span class="badge badge-success">Online Now</span>
              </div>
              <div style="flex: 1; background: rgba(0,0,0,0.5); border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; justify-content: flex-end; padding: 1rem;">
                 <div style="display: flex; justify-content: center; gap: 1rem; margin-top: auto;">
                    <button class="btn" style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 50%;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg></button>
                    <button class="btn" style="background: var(--danger); padding: 0.5rem; border-radius: 50%;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></button>
                 </div>
              </div>
              <div class="glass-card" style="position: absolute; bottom: -20px; left: -30px; padding: 1rem; width: 220px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                 <div style="display: flex; gap: 1rem; align-items: center;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: bold;">Dr</div>
                    <div>
                        <div style="font-weight: 600; font-size: 0.9rem;">Dr. Sarah Jenkins</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary)">Cardiologist</div>
                    </div>
                 </div>
              </div>
          </div>
        </div>
      </main>
    </div>
  `
}
