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
       alert('Doctor Profile Successfully Registered in NexHealth Database!');
       navigateTo('/doctor');

     } catch(e) {
       alert("Error Registering: " + e.message);
       btn.innerText = "Create Doctor Profile";
       btn.disabled = false;
     }
  };

  return `
    <div class="container fade-in" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 3rem 0;">
      <a href="/" class="logo" data-link style="margin-bottom: 2rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gradient"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        NexHealth
      </a>

      <div class="glass-card" style="width: 100%; max-width: 600px;">
        <h2 style="margin-bottom: 0.5rem; font-size: 1.8rem; text-align: center;">Doctor Partner Registration</h2>
        <p style="color: var(--text-secondary); margin-bottom: 2rem; text-align: center;">Join the medical network. Please provide your secure portal credentials.</p>

        <form style="display: flex; flex-direction: column; gap: 1.5rem;" onsubmit="event.preventDefault(); window.handleDoctorRegister();">
          
          <div style="padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
             <h3 style="font-size: 1rem; margin-bottom: 1rem; color: var(--primary);">1. Login Credentials</h3>
             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="input-group" style="margin: 0;">
                  <label style="font-size: 0.9rem; color: var(--text-secondary);">Email</label>
                  <input id="doc-email" type="email" class="input-glass" placeholder="doctor@clinic.com" required>
                </div>
                <div class="input-group" style="margin: 0;">
                  <label style="font-size: 0.9rem; color: var(--text-secondary);">Password (Min 6 chars)</label>
                  <input id="doc-pass" type="password" class="input-glass" placeholder="••••••••" required>
                </div>
             </div>
          </div>

          <div>
             <h3 style="font-size: 1rem; margin-bottom: 1rem; color: var(--accent);">2. Public Directory Profile</h3>
             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="input-group" style="margin: 0;">
                  <label style="font-size: 0.9rem; color: var(--text-secondary);">Full Name</label>
                  <input id="doc-name" type="text" class="input-glass" placeholder="Dr. First Last" required>
                </div>
                <div class="input-group" style="margin: 0;">
                  <label style="font-size: 0.9rem; color: var(--text-secondary);">Specialization</label>
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

             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="input-group" style="margin: 0;">
                  <label style="font-size: 0.9rem; color: var(--text-secondary);">Consultation Price (₹/hr)</label>
                  <input id="doc-price" type="number" class="input-glass" placeholder="e.g., 500" required>
                </div>
                <div class="input-group" style="margin: 0;">
                  <label style="font-size: 0.9rem; color: var(--text-secondary);">Available Timings</label>
                  <input id="doc-time" type="text" class="input-glass" placeholder="e.g., 10:00 AM - 04:00 PM" required>
               </div>
             </div>

             <div class="input-group" style="margin: 0;">
               <label style="font-size: 0.9rem; color: var(--text-secondary);">Clinic Address / Location</label>
               <input id="doc-loc" type="text" class="input-glass" placeholder="e.g., Annanda Chowk, Hazaribagh, Jharkhand 825301" required>
             </div>
          </div>

          <button id="doc-reg-btn" type="submit" class="btn btn-primary" style="margin-top: 1rem; width: 100%;">Create Doctor Profile</button>
          
          <div style="text-align: center; margin-top: 1rem;">
             <a href="/login" class="text-gradient" style="text-decoration: none; font-size: 0.9rem; font-weight: 500;" data-link>Already registered? Log In</a>
          </div>
        </form>
      </div>
    </div>
  `;
};
