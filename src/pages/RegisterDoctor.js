import { auth, db } from '../firebase.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { navigateTo } from '../main.js';

export const renderRegisterDoctor = () => {
  window.handleDoctorRegister = async () => {
     console.log("Submit button clicked! Capturing form elements...");
     const name = document.getElementById('doc-name').value;
     const spec = document.getElementById('doc-spec').value;
     const price = document.getElementById('doc-price').value;
     const time = document.getElementById('doc-time').value;
     const loc = document.getElementById('doc-loc').value;
     const email = document.getElementById('doc-email').value;
     const pass = document.getElementById('doc-pass').value;
     
     console.log("Values captured:", {name, spec, price, time, loc, email});
     
     const btn = document.getElementById('doc-reg-btn');
     btn.innerText = "Processing...";
     btn.disabled = true;

     try {
       console.log("Attempting Firebase Auth Creation...");
       // 1. Core Auth Creation
       const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
       const user = userCredential.user;

       // 2. Map global identity to 'doctor' role
       await setDoc(doc(db, 'users', user.uid), {
         uid: user.uid,
         name: name,
         email: email,
         role: 'doctor'
       });

       // 3. Add to the public 'doctors' searchable directory!
       await addDoc(collection(db, 'doctors'), {
          uid: user.uid,
          name: name,
          specialization: spec,
          price: parseInt(price),
          timings: time,
          location: loc,
          rating: 5.0, // Default for new doctors
          reviews: 0
       });
       
       localStorage.setItem('nexhealth_role', 'doctor');
       window.showToast('Doctor Profile Successfully Registered in NexHealth Database!', 'success');
       navigateTo('/doctor');

     } catch(e) {
       window.showToast("Error Registering: " + e.message, 'error');
       btn.innerText = "Create Doctor Profile";
       btn.disabled = false;
     }
  };

  return `
    <div style="display: grid; grid-template-columns: 1fr 1.2fr; min-height: 100vh; width: 100vw; overflow: hidden;">
      
      <!-- HERO IMAGE / LEFT -->
      <div style="position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; padding: 4rem; min-height: 35vh;">
         <img src="/dr-bg.png" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;" alt="Modern Clinic Interior">
         <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(11,17,32,1) 0%, rgba(11,17,32,0.4) 40%, rgba(11,17,32,0.2) 100%); z-index: 1;"></div>
         
         <div style="position: relative; z-index: 2;" class="fade-in delay-200">
           <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem;">
               <div style="padding: 0.8rem; background: rgba(59, 130, 246, 0.2); border-radius: 16px; border: 1px solid rgba(59, 130, 246, 0.4);">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
               </div>
               <h1 style="font-size: 2rem; color: white; margin: 0; font-weight: 700;">NexHealth <span style="font-weight: 300; color: var(--text-secondary);">Partners</span></h1>
           </div>
           <h1 style="font-size: 3.5rem; margin-bottom: 1rem; color: white; line-height: 1.15;">
             Practice Medicine, <br><span class="text-gradient">reimagined.</span>
           </h1>
           <p style="font-size: 1.2rem; color: rgba(255,255,255,0.8); max-width: 450px;">
             Grow your practice, consult via high-definition video, and manage your private schedule locally in Jharkhand securely.
           </p>
         </div>
      </div>

      <!-- AUTH FORM / RIGHT -->
      <div style="display: flex; flex-direction: column; align-items: center; padding: 3rem 2rem; background: var(--bg-color); overflow-y: auto; max-height: 100vh;">
        
        <div class="glass-card fade-in delay-300" style="width: 100%; max-width: 550px; padding: 2.5rem; background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          
          <h2 style="margin-bottom: 0.5rem; font-size: 1.8rem; text-align: center;">Doctor Partner Registration</h2>
          <p style="color: var(--text-secondary); margin-bottom: 2.5rem; text-align: center; font-size: 0.9rem;">Join the elite medical network. Please configure your secure public directory profile.</p>

          <form style="display: flex; flex-direction: column; gap: 1.5rem;" onsubmit="event.preventDefault(); window.handleDoctorRegister();">
            
            <div style="padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
               <h3 style="font-size: 0.95rem; margin-bottom: 1rem; color: var(--primary); text-transform: uppercase; letter-spacing: 1px;">1. Login Credentials</h3>
               <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
                  <div class="input-group" style="margin: 0;">
                    <label style="font-size: 0.85rem; color: var(--text-secondary);">Email</label>
                    <input id="doc-email" type="email" class="input-glass" placeholder="doctor@clinic.com" required>
                  </div>
                  <div class="input-group" style="margin: 0;">
                    <label style="font-size: 0.85rem; color: var(--text-secondary);">Secure Password (Min 6 chars)</label>
                    <input id="doc-pass" type="password" class="input-glass" placeholder="••••••••" required>
                  </div>
               </div>
            </div>

            <div style="margin-top: 0.5rem;">
               <h3 style="font-size: 0.95rem; margin-bottom: 1rem; color: var(--accent); text-transform: uppercase; letter-spacing: 1px;">2. Public Directory Profile</h3>
               
               <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
                  <div class="input-group" style="margin: 0;">
                    <label style="font-size: 0.85rem; color: var(--text-secondary);">Full Name</label>
                    <input id="doc-name" type="text" class="input-glass" placeholder="Dr. First Last" required>
                  </div>
                  <div class="input-group" style="margin: 0;">
                    <label style="font-size: 0.85rem; color: var(--text-secondary);">Specialization</label>
                    <select id="doc-spec" class="input-glass" style="appearance: none; background-color: rgba(0,0,0,0.5);" required>
                       <option value="" disabled selected>Select specialization...</option>
                       <option>General Physician</option>
                       <option>Cardiologist</option>
                       <option>Pediatrician</option>
                       <option>Orthopedic</option>
                       <option>Dermatologist</option>
                       <option>Gynecologist</option>
                    </select>
                  </div>
               </div>

               <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
                  <div class="input-group" style="margin: 0;">
                    <label style="font-size: 0.85rem; color: var(--text-secondary);">Consultation Price (₹/hr)</label>
                    <input id="doc-price" type="number" class="input-glass" placeholder="e.g., 500" required>
                  </div>
                  <div class="input-group" style="margin: 0;">
                    <label style="font-size: 0.85rem; color: var(--text-secondary);">Available Timings</label>
                    <input id="doc-time" type="text" class="input-glass" placeholder="e.g., 10:00 AM - 04:00 PM" required>
                 </div>
               </div>

               <div class="input-group" style="margin: 0;">
                 <label style="font-size: 0.85rem; color: var(--text-secondary);">Clinic Address / Location</label>
                 <input id="doc-loc" type="text" class="input-glass" placeholder="e.g., Annanda Chowk, Hazaribagh, Jharkhand 825301" required>
               </div>
            </div>

            <button id="doc-reg-btn" type="submit" class="btn btn-primary" style="margin-top: 1rem; width: 100%; padding: 0.85rem; font-size: 1rem;">Create Doctor Profile</button>
            
            <div style="text-align: center; margin-top: 1rem;">
               <a href="/login" class="text-gradient" style="text-decoration: none; font-size: 0.9rem; font-weight: 500;" data-link>Already registered? Log In</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
};
