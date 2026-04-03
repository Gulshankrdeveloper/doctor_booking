import { fakeAuth } from '../auth.js';

export const renderRoom = () => {
  const role = fakeAuth.getRole() || 'patient';
  const isDoctor = role === 'doctor';
  
  const peerName = isDoctor ? 'Alex Rivera (Patient)' : 'Dr. Sarah Jenkins (Cardiologist)';
  const selfVideoSize = isDoctor ? 'width: 150px; height: 100px;' : 'width: 150px; height: 100px;';
  
  // The doctor sees a notes/prescription panel on the right. The patient just sees their records or a chat.
  const sidePanel = isDoctor ? `
    <div style="flex: 1; max-width: 350px; background: rgba(0,0,0,0.3); border-left: var(--border-glass); padding: 1.5rem; display: flex; flex-direction: column;">
       <h3 style="margin-bottom: 1rem; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Active Session Notes
       </h3>
       
       <div class="input-group">
          <label style="font-size: 0.85rem; color: var(--text-secondary);">Chief Complaint</label>
          <input type="text" class="input-glass" value="Mild chest pain and shortness of breath">
       </div>
       
       <div class="input-group" style="flex: 1;">
          <label style="font-size: 0.85rem; color: var(--text-secondary);">Clinical Notes</label>
          <textarea class="input-glass" style="height: 100%; resize: none;" placeholder="Start typing notes here..."></textarea>
       </div>
       
       <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="alert('Prescription created and sent directly to the patient\\'s portal!')">Generate Prescription</button>
    </div>
  ` : `
    <div style="flex: 1; max-width: 350px; background: rgba(0,0,0,0.3); border-left: var(--border-glass); padding: 1.5rem; display: flex; flex-direction: column;">
       <h3 style="margin-bottom: 1rem; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          Live Chat & Files
       </h3>
       
       <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; padding-bottom: 1rem;">
          <div style="background: rgba(255,255,255,0.05); padding: 0.8rem; border-radius: var(--radius-sm); align-self: flex-start; max-width: 85%;">
             <p style="font-size: 0.9rem; margin: 0; color: var(--text-secondary); margin-bottom: 0.2rem;">Dr. Jenkins</p>
             <p style="font-size: 0.95rem; margin: 0;">Hello Alex, how are you feeling today?</p>
          </div>
          <div style="background: rgba(59, 130, 246, 0.2); padding: 0.8rem; border-radius: var(--radius-sm); align-self: flex-end; max-width: 85%; border-bottom-right-radius: 2px;">
             <p style="font-size: 0.95rem; margin: 0;">Hi doctor, still a bit of a cough but better.</p>
          </div>
       </div>
       
       <div style="display: flex; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
          <input type="text" class="input-glass" placeholder="Type a message..." style="flex: 1; margin: 0;">
          <button class="btn btn-outline" style="padding: 0 0.8rem;">Send</button>
       </div>
    </div>
  `;

  return `
    <div class="fade-in" style="height: 100vh; display: flex; flex-direction: column; background: #000;">
       <!-- Top Bar -->
       <div style="padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); border-bottom: var(--border-glass);">
          <div style="display: flex; align-items: center; gap: 1rem;">
             <div style="width: 12px; height: 12px; background: var(--danger); border-radius: 50%; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8); animation: pulse 2s infinite;"></div>
             <span style="font-size: 1.1rem; font-weight: 500;">Live Consultation</span>
             <span class="badge badge-info" style="margin-left: 1rem;">04:23</span>
          </div>
          <button onclick="window.history.back()" class="btn btn-outline" style="border: none; color: var(--text-secondary);">← Leave Session</button>
       </div>
       
       <!-- Main Workspace -->
       <div style="flex: 1; display: flex; overflow: hidden;">
          
          <!-- Video Area -->
          <div style="flex: 2; position: relative; display: flex; justify-content: center; align-items: center; background: #111;">
             <!-- Peer Video Placeholder -->
             <div style="width: 100%; height: 100%; background: url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200') center/cover; opacity: 0.7;"></div>
             
             <!-- Peer Name Badge -->
             <div style="position: absolute; bottom: 2rem; left: 2rem; background: rgba(0,0,0,0.6); padding: 0.5rem 1rem; border-radius: var(--radius-sm); border: var(--border-glass); backdrop-filter: blur(4px);">
                <span style="font-weight: 600;">${peerName}</span>
             </div>
             
             <!-- Self Video Thumbnail -->
             <div style="position: absolute; top: 2rem; right: 2rem; ${selfVideoSize} border-radius: var(--radius-sm); overflow: hidden; border: 2px solid rgba(255,255,255,0.2); background: #333; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                 <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; font-size: 0.8rem; color: var(--text-secondary);">Camera Off</div>
             </div>

             <!-- Controls -->
             <div style="position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); display: flex; gap: 1rem; background: rgba(0,0,0,0.6); padding: 0.8rem 1.5rem; border-radius: 30px; border: var(--border-glass); backdrop-filter: blur(8px);">
                <button class="btn" style="background: rgba(255,255,255,0.1); padding: 0.8rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </button>
                <button class="btn" style="background: rgba(255,255,255,0.1); padding: 0.8rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                </button>
                <button class="btn" style="background: rgba(255,255,255,0.1); padding: 0.8rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </button>
                <button onclick="window.history.back()" class="btn" style="background: var(--danger); padding: 0.8rem 1.5rem; border-radius: 30px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: white;">
                   End Call
                </button>
             </div>
          </div>
          
          <!-- Side Panel -->
          ${sidePanel}
       </div>
    </div>
  `;
};
