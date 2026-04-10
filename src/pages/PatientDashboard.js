import { auth, db } from '../firebase.js';
import { collection, getDocs, addDoc, onSnapshot, query, where } from 'firebase/firestore';

export const renderPatientDashboard = () => {
  // If no tab is set, default to overview
  if (!window.currentPatientTab) window.currentPatientTab = 'overview';

  window.setPatientTab = (tab) => {
    window.currentPatientTab = tab;
    const content = document.getElementById('patient-content');
    if (content) {
      content.innerHTML = renderPatientContent();
      content.className = 'main-content fade-in'; // trigger animation
      
      // Update active states on sidebar
      document.querySelectorAll('.patient-nav-btn').forEach(btn => {
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
      
      // Async trigger for database listings
      if (tab === 'overview') {
         setTimeout(() => window.fetchPatientAppointments(), 0);
      }
      if (tab === 'find') {
         fetchDoctorsFromDatabase();
      }
      if (tab === 'records') {
         setTimeout(() => window.fetchPatientRecords(), 0);
      }
    }
  };

  window.openBookingModal = (doctorName, doctorLocation) => {
      document.getElementById('booking-doctor-name').innerText = doctorName;
      const offlineOpt = document.getElementById('book-offline-opt');
      if (offlineOpt) {
          const locStr = doctorLocation || 'In-Person Clinic';
          offlineOpt.value = locStr;
          offlineOpt.innerText = `In-Person (${locStr})`;
      }
      document.getElementById('booking-modal').classList.add('active');
  };

  window.closeBookingModal = () => {
      document.getElementById('booking-modal').classList.remove('active');
  };

  const renderSidebarItem = (id, label, icon) => {
      const isActive = window.currentPatientTab === id;
      const bg = isActive ? 'rgba(255,255,255,0.1)' : 'transparent';
      const color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
      const border = isActive ? '3px solid var(--primary)' : '3px solid transparent';
      
      return `
        <button class="btn btn-outline patient-nav-btn" data-tab="${id}" 
                onclick="window.setPatientTab('${id}')" 
                style="justify-content: flex-start; border: none; border-left: ${border}; background: ${bg}; color: ${color}; border-radius: 0 8px 8px 0; transition: all 0.2s;">
          <span style="margin-right: 10px;">${icon}</span> ${label}
        </button>
      `;
  };

  const renderSidebar = () => {
    return `
      <a href="/" class="logo" data-link style="margin-bottom: 2rem; display: block; padding-left: 1rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gradient"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        NexHealth
      </a>
      <nav style="display: flex; flex-direction: column; gap: 0.5rem; height: calc(100% - 100px);">
        ${renderSidebarItem('overview', 'Overview', '🏠')}
        ${renderSidebarItem('find', 'Find Doctors', '🔍')}
        ${renderSidebarItem('records', 'Medical Records', '📄')}
        ${renderSidebarItem('settings', 'Settings', '⚙️')}
        <button onclick="window.handleLogout()" class="btn btn-outline" style="justify-content: flex-start; border: none; color: var(--danger); margin-top: auto; padding-left: 1rem;">Logout</button>
      </nav>
    `;
  };

  window.handleBookingSubmit = async (e) => {
      e.preventDefault();
      const reason = document.getElementById('book-reason').value;
      const date = document.getElementById('book-date').value;
      const time = document.getElementById('book-time').value;
      const loc = document.getElementById('book-loc').value;
      const docName = document.getElementById('booking-doctor-name').innerText;
      
      const btn = document.getElementById('book-btn');
      btn.innerText = "Booking...";
      btn.disabled = true;

      try {
         await addDoc(collection(db, 'appointments'), {
            patientId: auth.currentUser ? auth.currentUser.uid : 'anonymous',
            patientEmail: localStorage.getItem('nexhealth_email') || 'patient@example.com',
            patientName: localStorage.getItem('nexhealth_name') || 'Patient',
            doctorName: docName,
            reason: reason,
            date: date,
            time: time,
            location: loc,
            status: 'pending'
         });
         window.showToast('Appointment Successfully Booked in Database!', 'success');
         window.closeBookingModal();
         window.setPatientTab('overview');
      } catch(err) {
         window.showToast('Error Booking: ' + err.message, 'error');
      } finally {
         btn.innerText = "Confirm Booking";
         btn.disabled = false;
      }
  };

  const renderBookingModal = () => {
     return `
      <div id="booking-modal" class="modal-overlay">
        <div class="modal-content">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
             <h2 style="font-size: 1.5rem;">Book Appointment</h2>
             <button class="btn btn-outline" style="padding: 0.2rem 0.5rem; border: none;" onclick="window.closeBookingModal()">&times;</button>
          </div>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Scheduling consultation with <strong id="booking-doctor-name" style="color: var(--text-primary);"></strong>.</p>
          
          <form onsubmit="window.handleBookingSubmit(event)">
            <div class="input-group">
               <label style="font-size: 0.9rem; color: var(--text-secondary);">Reason for visit</label>
               <input id="book-reason" type="text" class="input-glass" placeholder="e.g., Annual checkup, mild cough, etc." required>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="input-group">
                   <label style="font-size: 0.9rem; color: var(--text-secondary);">Date</label>
                   <input id="book-date" type="date" class="input-glass" style="color-scheme: dark;" required>
                </div>
                <div class="input-group">
                   <label style="font-size: 0.9rem; color: var(--text-secondary);">Time</label>
                   <input id="book-time" type="time" class="input-glass" style="color-scheme: dark;" required>
                </div>
            </div>

            <div class="input-group" style="margin-bottom: 2rem;">
               <label style="font-size: 0.9rem; color: var(--text-secondary);">Location & Format</label>
               <select id="book-loc" class="input-glass" style="appearance: none; background-color: rgba(0,0,0,0.5);" required>
                  <option value="" disabled selected>Select an option...</option>
                  <option value="online">Online Video Consultation</option>
                  <option id="book-offline-opt" value="downtown">Offline - Downtown Clinic</option>
               </select>
            </div>

            <button id="book-btn" type="submit" class="btn btn-primary" style="width: 100%;">Confirm Booking</button>
          </form>
        </div>
      </div>
     `;
  };

  window.fetchPatientRecords = () => {
    const listContainer = document.getElementById('patient-records-list');
    if(!listContainer) return;

    if (window.unsubRecords) window.unsubRecords();

    try {
      const email = localStorage.getItem('nexhealth_email');
      const q = query(collection(db, 'prescriptions'), where("patientEmail", "==", email));
      window.unsubRecords = onSnapshot(q, (querySnapshot) => {
          if (querySnapshot.empty) {
             listContainer.innerHTML = '<p style="color: var(--text-secondary);">No medical records or prescriptions found.</p>';
             return;
          }

          let htmlBlock = '';
          querySnapshot.forEach((docSnap) => {
            const d = docSnap.data();
            htmlBlock += `
               <div class="glass-card" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                 <div style="display: flex; gap: 1rem; align-items: center;">
                     <div style="padding: 0.8rem; background: rgba(16, 185, 129, 0.2); border-radius: var(--radius-sm); color: var(--accent);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                     </div>
                     <div>
                         <h4 style="margin-bottom: 0.2rem;">Digital Prescription</h4>
                         <p style="color: var(--text-secondary); font-size: 0.8rem; margin: 0;">Issued by ${d.doctorName} • ${d.date}</p>
                         <p style="color: var(--text-primary); font-size: 0.85rem; margin-top: 0.5rem; white-space: pre-line;"><strong>Rx:</strong> ${d.notes}</p>
                     </div>
                 </div>
                 <button class="btn btn-outline" onclick="window.showToast('Generating secure PDF...', 'info')">Download PDF</button>
               </div>
            `;
          });
          listContainer.innerHTML = htmlBlock;
      }, (error) => {
         listContainer.innerHTML = '<p style="color: var(--danger);">Error loading records: ' + error.message + '</p>';
      });
    } catch(e) {
      console.error(e);
    }
  };

  const fetchDoctorsFromDatabase = () => {
    const listContainer = document.getElementById('doctor-list-container');
    if(!listContainer) return;

    if (window.unsubDoctors) {
        window.unsubDoctors();
    }

    try {
      window.unsubDoctors = onSnapshot(collection(db, 'doctors'), (querySnapshot) => {
      if (querySnapshot.empty) {
         listContainer.innerHTML = '<p style="color: var(--text-secondary);">No doctors currently registered in the database.</p>';
         return;
      }

      let htmlBlock = '';
      querySnapshot.forEach((docSnap) => {
        const d = docSnap.data();
        htmlBlock += `
          <div class="glass-card" style="display: flex; gap: 1.5rem; border-color: rgba(59, 130, 246, 0.4);">
             <div style="width: 90px; height: 90px; border-radius: var(--radius-sm); overflow: hidden; border: 2px solid rgba(255,255,255,0.1); flex-shrink: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <img src="/doc${((d.name || 'a').length % 3) + 1}.png" style="width: 100%; height: 100%; object-fit: cover; object-position: top;" alt="Doctor Profile">
             </div>
             <div style="flex: 1;">
                 <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                     <div>
                        <h3 style="font-size: 1.3rem; margin-bottom: 0.2rem;">${d.name}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.2rem;">${d.specialization}</p>
                        <p style="color: #fbbf24; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">★ ${d.rating} <span style="color: var(--text-secondary); font-weight: 400;">(${d.reviews || 0} reviews)</span></p>
                     </div>
                     <div style="text-align: right;">
                        <div style="font-size: 1.4rem; font-weight: 700; color: var(--text-primary);">₹${d.price}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">per consult</div>
                     </div>
                 </div>
                 
                 <div style="display: flex; justify-content: space-between; align-items:flex-end; margin-top: 0.5rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                        <span style="font-size: 0.85rem; display: flex; align-items: center; gap: 0.3rem; color: var(--text-secondary);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${d.timings}</span>
                        <span style="font-size: 0.85rem; display: flex; align-items: center; gap: 0.3rem; color: var(--text-secondary);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${d.location}</span>
                    </div>
                    <button class="btn btn-primary" onclick="window.openBookingModal('${d.name}', '${d.location || ''}')">Select & Book</button>
                 </div>
             </div>
          </div>
        `;
      });
      listContainer.innerHTML = htmlBlock;
      }, (error) => {
         listContainer.innerHTML = '<p style="color: var(--danger);">Error in live sync: ' + error.message + '</p>';
      });
    } catch(e) {
       listContainer.innerHTML = '<p style="color: var(--danger);">Error setting up database sync: ' + e.message + '</p>';
    }
  };

  return `
    <div class="dashboard-layout fade-in">
      <aside class="sidebar" style="padding-left: 0; padding-right: 1rem;">
        ${renderSidebar()}
      </aside>
      <main class="main-content" id="patient-content">
        ${renderPatientContent()}
      </main>
      ${renderBookingModal()}
    </div>
  `;
};

  window.fetchPatientAppointments = () => {
    const listContainer = document.getElementById('patient-appointments-list');
    if(!listContainer) return;

    if (window.unsubPatAppointments) window.unsubPatAppointments();

    try {
      const uid = auth.currentUser ? auth.currentUser.uid : 'anonymous';
      const q = query(collection(db, 'appointments'), where("patientId", "==", uid));
      window.unsubPatAppointments = onSnapshot(q, (querySnapshot) => {
          if (querySnapshot.empty) {
             listContainer.innerHTML = '<p style="color: var(--text-secondary);">No upcoming appointments scheduled.</p>';
             return;
          }

          let htmlBlock = '';
          querySnapshot.forEach((docSnap) => {
            const d = docSnap.data();
            const isOnline = d.location === 'online';
            const badgeColor = isOnline ? 'badge-info' : 'badge-success';
            const formatStr = isOnline ? 'Online Video' : 'In-Person Clinic';
            const clinicLocation = isOnline ? '' : d.location || '123 Healthway Medical Plaza';
            
            // Dynamic Embed Google Maps URL logic based on location string
            const safeLocationQuery = encodeURIComponent(clinicLocation);
            
            htmlBlock += `
              <div class="glass-card" style="margin-bottom: 1rem; position: relative; overflow: hidden; ${!isOnline ? 'padding-bottom: 1rem;' : ''}">
                <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${isOnline ? 'var(--primary)' : 'var(--accent)'};"></div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; ${!isOnline ? 'margin-bottom: 1rem;' : ''}">
                  <div style="display: flex; gap: 1rem;">
                    <div style="width: 50px; height: 50px; border-radius: 10px; overflow: hidden; border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 0 15px rgba(59,130,246,0.3); flex-shrink: 0;">
                      <img src="/doc3.png" style="width: 100%; height: 100%; object-fit: cover; object-position: top;" alt="Doctor Portrait">
                    </div>
                    <div>
                      <h4 style="font-size: 1.1rem; margin-bottom: 0.25rem;">${d.doctorName}</h4>
                      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
                         <span class="badge ${badgeColor}" style="margin-right: 0.5rem; font-size: 0.7rem;">${formatStr}</span> For: ${d.reason}
                      </p>
                      <div style="display: flex; gap: 1rem; font-size: 0.85rem; ${!isOnline ? 'margin-bottom: 0.5rem;' : ''}">
                        <span style="display: flex; align-items: center; gap: 0.25rem; color: var(--text-primary);">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${isOnline ? 'var(--primary)' : 'var(--accent)'}" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> 
                          ${d.date}, ${d.time}
                        </span>
                      </div>
                      ${!isOnline ? `
                      <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.25rem;">
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                         ${clinicLocation}
                      </div>
                      ` : ''}
                    </div>
                  </div>
                  ${isOnline ? `
                     <a href="/room" data-link class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Join Call</a>
                  ` : `
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                       <a href="https://www.google.com/maps/dir/?api=1&destination=${safeLocationQuery}" target="_blank" class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.8rem;">Real Directions</a>
                       <button class="btn btn-outline" style="padding: 0.4rem 1rem; font-size: 0.8rem;">Reschedule</button>
                    </div>
                  `}
                </div>
                
                ${!isOnline ? `
                <div style="border-radius: var(--radius-sm); overflow: hidden; border: 1px solid rgba(255,255,255,0.1); height: 150px; background: #222;">
                    <iframe width="100%" height="100%" src="https://maps.google.com/maps?width=100%25&amp;height=100%25&amp;hl=en&amp;q=${safeLocationQuery}&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
                </div>
                ` : ''}
              </div>
            `;
          });
          listContainer.innerHTML = htmlBlock;
      }, (error) => {
         listContainer.innerHTML = '<p style="color: var(--danger);">Error loading appointments: ' + error.message + '</p>';
      });
    } catch(e) {
      console.error(e);
    }
  };

const renderPatientContent = () => {
  const tab = window.currentPatientTab;

  // Immediate fetch if rendering specifically on mount
  if (tab === 'overview') {
     setTimeout(() => window.fetchPatientAppointments(), 10);
  } else if (tab === 'records') {
     setTimeout(() => window.fetchPatientRecords(), 10);
  } else if (tab === 'find') {
     setTimeout(() => window.fetchDoctorsFromDatabase(), 10);
  }

  if (tab === 'overview') {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;">
        <div>
          <h2 style="font-size: 2rem;">Welcome back, Alex</h2>
          <p style="color: var(--text-secondary);">Here's your health overview for today.</p>
        </div>
        <div style="display: flex; gap: 1.5rem; align-items: center;">
          <div style="position: relative; cursor: pointer;">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
             <span style="position: absolute; top: -5px; right: -5px; background: var(--danger); width: 10px; height: 10px; border-radius: 50%;"></span>
          </div>
          <div style="width: 45px; height: 45px; border-radius: 50%; background: var(--bg-glass); display: flex; align-items: center; justify-content: center; font-weight: bold; border: var(--border-glass)">AL</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
        <!-- Upcoming Appointments -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="margin: 0;">Upcoming Appointments</h3>
            <a href="#" onclick="event.preventDefault(); window.setPatientTab('records')" style="color: var(--primary); font-size: 0.9rem; text-decoration: none;">View All</a>
          </div>
          
          <div id="patient-appointments-list">
            <p style="color: var(--text-secondary);">Loading your live appointments database...</p>
          </div>
        </div>

        <div>
           <div style="margin-bottom: 2rem;">
               <h3 style="margin-bottom: 1rem;">Action Needed</h3>
               <div class="glass-card" style="padding: 1rem; background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.3);">
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="font-size: 0.95rem; margin-bottom: 0.2rem;">New Prescription</h4>
                        <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">Dr. Jenkins sent a new Rx.</p>
                    </div>
                    <button onclick="window.setPatientTab('records')" class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Download</button>
                 </div>
               </div>
           </div>

           <h3 style="margin-bottom: 1rem;">Quick Find</h3>
           <div class="glass-card">
             <div class="input-group">
               <label style="font-size: 0.9rem; color: var(--text-secondary);">Consultation Type</label>
               <select class="input-glass" style="appearance: none; background-color: rgba(0,0,0,0.5); padding: 0.5rem;">
                  <option value="both">Online & In-Person</option>
                  <option value="online">Online (Video) Only</option>
                  <option value="offline">In-Person (Clinic) Only</option>
               </select>
             </div>
             <button onclick="window.setPatientTab('find')" class="btn btn-primary" style="width: 100%; padding: 0.5rem;">Search Directory</button>
           </div>
        </div>
      </div>
    `;
  }

  if (tab === 'find') {
    return `
      <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Doctor Directory</h2>
          <p style="color: var(--text-secondary); margin: 0;">Find providers by location, price, and patient reviews.</p>
        </div>
        <div>
           <label style="font-size: 0.85rem; color: var(--text-secondary); margin-right: 0.5rem;">Sort By:</label>
           <select class="input-glass" style="appearance: none; background-color: rgba(0,0,0,0.5); padding: 0.5rem 2rem 0.5rem 1rem;">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Distance: Nearest First</option>
              <option>Highest Rated</option>
           </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem;">
         
         <!-- ADVANCED FILTERS PANEL -->
         <div class="glass-card" style="align-self: start; padding: 1.5rem;">
            <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
               Filters
            </h3>

   <div class="input-group" style="margin-bottom: 1.5rem;">
               <label style="font-size: 0.9rem; font-weight: 500; color: var(--text-primary);">Search Radius / Location</label>
               <input type="text" class="input-glass" placeholder="Zip Code or City" value="Hazaribagh, JH" style="margin-bottom: 0.5rem;">
               <select class="input-glass" style="appearance: none; background-color: rgba(0,0,0,0.5);">
                  <option selected>Within 5 miles</option>
                  <option>Within 10 miles</option>
                  <option>Within 25 miles</option>
                  <option>Nationwide (Online Only)</option>
               </select>
            </div>

            <div class="input-group" style="margin-bottom: 1.5rem;">
               <label style="font-size: 0.9rem; font-weight: 500; color: var(--text-primary);">Consultation Price max.</label>
               <div style="display: flex; gap: 1rem; align-items: center;">
                 <input type="range" min="50" max="500" value="150" style="flex: 1;" oninput="document.getElementById('price-val').innerText = '$' + this.value">
                 <span id="price-val" style="font-size: 0.9rem; font-weight: 600; color: var(--primary);">$150</span>
               </div>
               <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">Showing doctors under this rate.</p>
            </div>

            <div class="input-group" style="margin-bottom: 1.5rem;">
               <label style="font-size: 0.9rem; font-weight: 500; color: var(--text-primary); margin-bottom: 0.5rem;">Patient Ratings</label>
               <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer; margin-bottom: 0.5rem;">
                 <input type="checkbox" checked> <span style="color: #fbbf24;">★★★★★</span> 5 Stars
               </label>
               <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer; margin-bottom: 0.5rem;">
                 <input type="checkbox" checked> <span style="color: #fbbf24;">★★★★☆</span> 4+ Stars
               </label>
               <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                 <input type="checkbox"> <span style="color: #fbbf24;">★★★☆☆</span> 3+ Stars
               </label>
            </div>

            <div class="input-group" style="margin-bottom: 1.5rem;">
               <label style="font-size: 0.9rem; font-weight: 500; color: var(--text-primary); margin-bottom: 0.5rem;">Availability</label>
               <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer; margin-bottom: 0.5rem;">
                 <input type="checkbox" checked> Available Today
               </label>
               <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                 <input type="checkbox"> Available This Week
               </label>
            </div>

            <button class="btn btn-outline" style="width: 100%; font-size: 0.85rem;">Reset Filters</button>
         </div>

         <!-- DOCTOR LISTINGS MAIN -->
         <div>
            <p style="margin-bottom: 1.5rem; font-size: 0.95rem; color: var(--text-secondary);">Showing registered doctors near Hazaribagh, JH</p>

            <div id="doctor-list-container" style="display: flex; flex-direction: column; gap: 1.5rem;">
               <p style="color: var(--text-secondary);">Fetching latest doctor directory from database...</p>
            </div>
         </div>
      </div>
    `;
  }

  if (tab === 'records') {
    return `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Medical Records & Prescriptions</h2>
        <p style="color: var(--text-secondary);">Manage your health documents securely.</p>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
         <div>
             <h3 style="margin-bottom: 1rem;">Recent Files</h3>
             <div id="patient-records-list">
                <p style="color: var(--text-secondary);">Loading secure records...</p>
             </div>
         </div>

         <div>
             <h3 style="margin-bottom: 1rem;">Upload Report</h3>
             <div class="glass-card" style="text-align: center; padding: 2rem; border: 2px dashed rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); cursor: pointer;" onclick="alert('Upload prompt opened')">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary); margin-bottom: 1rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                 <h4 style="margin-bottom: 0.5rem;">Click to Upload</h4>
                 <p style="color: var(--text-secondary); font-size: 0.85rem;">Drag and drop PDF, JPG, or PNG files<br>(Max 10MB)</p>
             </div>
         </div>
      </div>
    `;
  }

  if (tab === 'settings') {
    return `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Profile Settings</h2>
        <p style="color: var(--text-secondary);">Manage your account and personal details.</p>
      </div>

      <div class="glass-card" style="max-width: 600px;">
         <form onsubmit="event.preventDefault(); window.showToast('Settings saved!', 'success');">
            <h3 style="margin-bottom: 1.5rem;">Personal Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
               <div class="input-group">
                 <label style="font-size: 0.9rem; color: var(--text-secondary);">First Name</label>
                 <input type="text" class="input-glass" value="Alex">
               </div>
               <div class="input-group">
                 <label style="font-size: 0.9rem; color: var(--text-secondary);">Last Name</label>
                 <input type="text" class="input-glass" value="Rivera">
               </div>
            </div>

            <div class="input-group" style="margin-bottom: 1.5rem;">
               <label style="font-size: 0.9rem; color: var(--text-secondary);">Email</label>
               <input type="email" class="input-glass" value="alex@example.com">
            </div>

            <h3 style="margin-bottom: 1.5rem; margin-top: 2rem;">Insurance Details</h3>
            <div class="input-group" style="margin-bottom: 1.5rem;">
               <label style="font-size: 0.9rem; color: var(--text-secondary);">Provider</label>
               <input type="text" class="input-glass" value="Blue Cross Blue Shield">
            </div>
            <div class="input-group" style="margin-bottom: 2rem;">
               <label style="font-size: 0.9rem; color: var(--text-secondary);">Member ID</label>
               <input type="password" class="input-glass" value="123456789">
            </div>

            <button type="submit" class="btn btn-primary">Save Changes</button>
         </form>
      </div>
    `;
  }

  return ``;
};
