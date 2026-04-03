import { auth, db } from '../firebase.js';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export const renderDoctorDashboard = () => {
  if (!window.currentDoctorTab) window.currentDoctorTab = 'schedule';

  window.setDoctorTab = (tab) => {
    window.currentDoctorTab = tab;
    const content = document.getElementById('doctor-content');
    if (content) {
      content.innerHTML = renderDoctorContent();
      content.className = 'main-content fade-in'; // trigger animation
      
      // Update active states on sidebar
      document.querySelectorAll('.doctor-nav-btn').forEach(btn => {
        if(btn.dataset.tab === tab) {
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.color = 'var(--text-primary)';
            btn.style.borderLeft = '3px solid var(--primary)';
        } else {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-secondary)';
            btn.style.borderLeft = '3px solid transparent';
        }
      });
      // Trigger async fetch for appointments
      if (tab === 'schedule') {
          setTimeout(() => window.fetchDoctorAppointments(), 0);
      }
    }
  };

  const renderSidebarItem = (id, label, icon) => {
      const isActive = window.currentDoctorTab === id;
      const bg = isActive ? 'rgba(255,255,255,0.1)' : 'transparent';
      const color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
      const border = isActive ? '3px solid var(--primary)' : '3px solid transparent';
      
      return `
        <button class="btn btn-outline doctor-nav-btn" data-tab="${id}" 
                onclick="window.setDoctorTab('${id}')" 
                style="justify-content: flex-start; border: none; border-left: ${border}; background: ${bg}; color: ${color}; border-radius: 0 8px 8px 0; transition: all 0.2s;">
          <span style="margin-right: 10px;">${icon}</span> ${label}
        </button>
      `;
  };

  const renderSidebar = () => {
    return `
      <a href="/" class="logo" data-link style="margin-bottom: 2rem; display: block; padding-left: 1rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gradient"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        NexHealth Pro
      </a>
      <nav style="display: flex; flex-direction: column; gap: 0.5rem; height: calc(100% - 100px);">
        ${renderSidebarItem('schedule', 'Schedule', '📅')}
        ${renderSidebarItem('patients', 'My Patients', '👥')}
        ${renderSidebarItem('consultations', 'Consultations', '🩺')}
        ${renderSidebarItem('earnings', 'Earnings & Stats', '📈')}
        <button onclick="window.handleLogout()" class="btn btn-outline" style="justify-content: flex-start; border: none; color: var(--danger); margin-top: auto; padding-left: 1rem;">Logout</button>
      </nav>
    `;
  };

  return `
    <div class="dashboard-layout fade-in">
      <aside class="sidebar" style="padding-left: 0; padding-right: 1rem;">
        ${renderSidebar()}
      </aside>
      <main class="main-content" id="doctor-content">
        ${renderDoctorContent()}
      </main>
    </div>
  `;
};

const renderDoctorContent = () => {
  const tab = window.currentDoctorTab;

  window.fetchDoctorAppointments = async () => {
     const container = document.getElementById('doc-schedule-container');
     if (!container) return;
     
     try {
       // Ideally we filter by Doctor UID, but for this demo scale, we fetch all appointments 
       // where doctorName was recorded, or just all of them to show the real-time link.
       const qSnap = await getDocs(collection(db, 'appointments'));
       if (qSnap.empty) {
           container.innerHTML = '<p style="color: var(--text-secondary);">No appointments scheduled yet.</p>';
           return;
       }
       
       let html = '';
       qSnap.forEach(doc => {
          const d = doc.data();
          const badgeColor = d.location === 'online' ? 'badge-info' : 'badge-success';
          const format = d.location === 'online' ? 'Online Video' : 'In-Person Clinic';
          
          html += `
              <div class="glass-card fade-in" style="display: flex; align-items: center; gap: 1.5rem; position: relative; overflow: hidden; border-color: rgba(255,255,255,0.1);">
                 <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--primary);"></div>
                 <div style="font-weight: 700; width: 80px; color: var(--primary); text-align: right;">${d.time}</div>
                 <div style="width: 2px; height: 40px; background: rgba(255,255,255,0.1);"></div>
                 <div style="flex: 1;">
                    <h4 style="margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.5rem;">
                      ${d.reason}
                      <span class="badge ${badgeColor}" style="font-size: 0.65rem; font-weight: 500; padding: 0.15rem 0.5rem;">${format}</span>
                    </h4>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Date: ${d.date} • Booked for: ${d.doctorName}</p>
                 </div>
                 <a href="/room" data-link class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Start Call</a>
              </div>
          `;
       });
       container.innerHTML = html;
     } catch (e) {
       container.innerHTML = '<p style="color: var(--danger);">Error fetching database: ' + e.message + '</p>';
     }
  };

  // Immediate fetch if rendering schedule specifically on mount
  if (tab === 'schedule') {
     setTimeout(() => window.fetchDoctorAppointments(), 10);
  }

  if (tab === 'schedule') {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;">
        <div>
          <h2 style="font-size: 2rem;">Dr. Jenkins's Schedule</h2>
          <p style="color: var(--text-secondary);">You have 5 appointments today.</p>
        </div>
        <div style="display: flex; gap: 1.5rem; align-items: center;">
          <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">+ Add Block</button>
          <div style="position: relative; cursor: pointer;">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
             <span style="position: absolute; top: -5px; right: -5px; background: var(--danger); width: 10px; height: 10px; border-radius: 50%;"></span>
          </div>
          <div style="width: 45px; height: 45px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: var(--shadow-glow)">SJ</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
        <!-- Calendar / Appointments List -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
             <h3 style="margin: 0;">Today</h3>
             <span class="badge badge-info">Oct 12, 2026</span>
          </div>
          
          <div id="doc-schedule-container" style="display: flex; flex-direction: column; gap: 1rem;">
             <p style="color: var(--text-secondary);">Loading your live appointments...</p>
          </div>
        </div>

        <!-- Pending Prescriptions or Reports -->
        <div>
           <h3 style="margin-bottom: 1rem;">Action Needed</h3>
           <div class="glass-card">
             <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
               <h4 style="font-size: 0.95rem; margin-bottom: 0.25rem;">Review Lab Results</h4>
               <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Patient: David Smith</p>
               <a href="#" style="color: var(--primary); font-size: 0.85rem; text-decoration: none;">View PDF &rarr;</a>
             </div>
             <div>
               <h4 style="font-size: 0.95rem; margin-bottom: 0.25rem;">Prescription Renewal</h4>
               <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Patient: Emma Wilson</p>
               <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-top: 0.25rem;" onclick="window.setDoctorTab('consultations')">Review & Approve</button>
             </div>
           </div>
        </div>
      </div>
    `;
  }

  if (tab === 'patients') {
    return `
      <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Patient Directory</h2>
          <p style="color: var(--text-secondary);">Manage patient files and historical records.</p>
        </div>
        <div style="display: flex; gap: 1rem;">
           <input type="text" class="input-glass" placeholder="Search patient name or ID..." style="min-width: 250px;">
           <button class="btn btn-primary">Search</button>
        </div>
      </div>

      <div class="glass-card" style="padding: 0;">
         <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
               <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); font-size: 0.9rem;">
                  <th style="padding: 1.5rem; font-weight: 500;">Patient Name</th>
                  <th style="padding: 1.5rem; font-weight: 500;">Last Visit</th>
                  <th style="padding: 1.5rem; font-weight: 500;">Status</th>
                  <th style="padding: 1.5rem; font-weight: 500;">Actions</th>
               </tr>
            </thead>
            <tbody>
               <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <td style="padding: 1.5rem;">
                     <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-glass-light); border: var(--border-glass); display: flex; justify-content: center; align-items: center;">AR</div>
                        <div>
                           <div style="font-weight: 600;">Alex Rivera</div>
                           <div style="font-size: 0.8rem; color: var(--text-secondary);">ID: #PT-1032</div>
                        </div>
                     </div>
                  </td>
                  <td style="padding: 1.5rem; color: var(--text-secondary); font-size: 0.9rem;">Oct 1, 2026</td>
                  <td style="padding: 1.5rem;"><span class="badge" style="background: rgba(16,185,129,0.1); color: #34d399;">Active Treatment</span></td>
                  <td style="padding: 1.5rem;">
                     <button class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">View File</button>
                  </td>
               </tr>
               <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <td style="padding: 1.5rem;">
                     <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-glass-light); border: var(--border-glass); display: flex; justify-content: center; align-items: center;">MG</div>
                        <div>
                           <div style="font-weight: 600;">Maria Garcia</div>
                           <div style="font-size: 0.8rem; color: var(--text-secondary);">ID: #PT-2940</div>
                        </div>
                     </div>
                  </td>
                  <td style="padding: 1.5rem; color: var(--text-secondary); font-size: 0.9rem;">Sep 15, 2026</td>
                  <td style="padding: 1.5rem;"><span class="badge" style="background: rgba(59,130,246,0.1); color: #60a5fa;">Follow-up Needed</span></td>
                  <td style="padding: 1.5rem;">
                     <button class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">View File</button>
                  </td>
               </tr>
            </tbody>
         </table>
      </div>
    `;
  }

  if (tab === 'consultations') {
    return `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Consultation Tools</h2>
        <p style="color: var(--text-secondary);">Write digital prescriptions and review cases.</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
         <!-- RX Generator -->
         <div class="glass-card" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
               <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                 Digital Rx Generator
               </h3>
               <button class="btn btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">Clear</button>
            </div>
            
            <div class="input-group">
               <label style="font-size: 0.9rem; color: var(--text-secondary);">Patient Target</label>
               <input type="text" class="input-glass" placeholder="Search patient...">
            </div>
            <div class="input-group">
               <label style="font-size: 0.9rem; color: var(--text-secondary);">Medication Name & Dosage</label>
               <input type="text" class="input-glass" placeholder="e.g., Amoxicillin 500mg">
            </div>
            <div class="input-group">
               <label style="font-size: 0.9rem; color: var(--text-secondary);">Instructions</label>
               <textarea class="input-glass" placeholder="Take 1 tablet every 12 hours..." rows="3" style="resize: vertical;"></textarea>
            </div>
            
            <button class="btn btn-primary" style="margin-top: 1rem;" onclick="alert('Prescription successfully generated & sent to patient file.')">Generate & Sign Rx</button>
         </div>

         <!-- Active Chat / Notes -->
         <div class="glass-card" style="display: flex; flex-direction: column;">
            <h3 style="margin-bottom: 1rem;">Pending Rx Renewals</h3>
            <div style="padding: 1rem; border: var(--border-glass); border-radius: var(--radius-sm); margin-bottom: 1rem; background: rgba(0,0,0,0.2);">
               <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                  <strong style="color: var(--text-primary);">Emma Wilson</strong>
                  <span style="font-size: 0.8rem; color: var(--text-secondary);">Requested 2 hours ago</span>
               </div>
               <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">Atorvastatin 20mg - Needs 90 day refill.</p>
               <div style="display: flex; gap: 1rem;">
                  <button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.8rem;">Approve Refill</button>
                  <button class="btn btn-outline" style="padding: 0.4rem 1rem; font-size: 0.8rem; border-color: var(--danger); color: var(--danger);">Deny</button>
               </div>
            </div>
         </div>
      </div>
    `;
  }
  
  if (tab === 'earnings') {
    return `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Analytics & Earnings</h2>
        <p style="color: var(--text-secondary);">Your practice overview for the current month.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
         <div class="glass-card" style="text-align: center;">
            <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Total Consultations</div>
            <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary);">124</div>
            <div style="font-size: 0.8rem; color: #34d399; margin-top: 0.5rem;">↑ 12% vs last month</div>
         </div>
         <div class="glass-card" style="text-align: center;">
            <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">New Patients</div>
            <div style="font-size: 2.5rem; font-weight: 700; color: var(--accent);">28</div>
            <div style="font-size: 0.8rem; color: #34d399; margin-top: 0.5rem;">↑ 5% vs last month</div>
         </div>
         <div class="glass-card" style="text-align: center;">
            <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Estimated Revenue</div>
            <div style="font-size: 2.5rem; font-weight: 700; color: var(--text-primary);">$14,250</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">Payout pending</div>
         </div>
      </div>
      
      <div class="glass-card" style="text-align: center; padding: 4rem 1rem;">
         <h3 style="color: var(--text-secondary);">Revenue Chart Visualization</h3>
         <p style="color: rgba(255,255,255,0.2); font-size: 0.9rem; margin-top: 0.5rem;">[Canvas / Graph Component Mount Point]</p>
      </div>
    `;
  }

  return ``;
};
