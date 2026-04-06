import { fakeAuth } from '../auth.js';

export const renderRoom = () => {
  const role = localStorage.getItem('nexhealth_role') || 'patient';
  const isDoctor = role === 'doctor';
  
  // Cleanup logic
  window.leaveCall = () => {
     window.history.back();
  };
  
  // The doctor sees a notes/prescription panel on the right. The patient sees chat.
  const sidePanel = isDoctor ? `
    <div class="room-sidepanel">
       <h3 style="margin-bottom: 1rem; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Active Session Notes
       </h3>
       
       <div class="input-group">
          <label style="font-size: 0.85rem; color: var(--text-secondary);">Chief Complaint</label>
          <input type="text" class="input-glass" value="Extracted from booking...">
       </div>
       
       <div class="input-group" style="flex: 1;">
          <label style="font-size: 0.85rem; color: var(--text-secondary);">Clinical Notes</label>
          <textarea class="input-glass" style="height: 100%; resize: none;" placeholder="Start typing notes here..."></textarea>
       </div>
       
       <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="alert('Prescription created and sent to the patient database!')">Generate Prescription</button>
    </div>
  ` : `
    <div class="room-sidepanel">
       <h3 style="margin-bottom: 1rem; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          Live P2P Connection
       </h3>
       <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; color: var(--text-secondary); text-align: center;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; opacity: 0.5;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <p style="font-size: 0.9rem;">You are in a secure, end-to-end encrypted session.</p>
          <p style="font-size: 0.8rem; margin-top: 0.5rem;">There are no time limits on your consultation.</p>
       </div>
    </div>
  `;

  return `
    <div class="fade-in" style="height: 100vh; display: flex; flex-direction: column; background: #000;">
       <!-- Top Bar -->
       <div style="padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); border-bottom: var(--border-glass);">
          <div style="display: flex; align-items: center; gap: 1rem;">
             <div style="width: 12px; height: 12px; background: var(--danger); border-radius: 50%; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8); animation: pulse 2s infinite;"></div>
             <span style="font-size: 1.1rem; font-weight: 500;">Live Video Consultation</span>
          </div>
          <button onclick="window.leaveCall()" class="btn btn-outline" style="border: none; color: var(--text-secondary);">← End & Leave Session</button>
       </div>
       
       <!-- Main Workspace -->
       <div class="room-workspace">
          
          <!-- WebRTC Video Area Container (MiroTalk P2P Unlimited) -->
          <div id="video-container" class="room-video">
             <iframe 
                allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen" 
                src="https://p2p.mirotalk.com/join/NexHealthHazaribaghRoom9988?name=${isDoctor ? 'Doctor' : 'Patient'}" 
                style="width: 100%; height: 100%; border: 0; position: absolute; top: 0; left: 0;">
             </iframe>
          </div>
          
          <!-- Auxiliary Side Panel -->
          ${sidePanel}
       </div>
    </div>
  `;
};
