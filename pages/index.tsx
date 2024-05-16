import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

function LoginModal({ onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Logged in successfully with token:', data.token);
        onClose();
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={onClose}>&times;</span>
        <h2>Login</h2>
        <input type="text" className={styles.inputFields} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" className={styles.inputFields} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className={`${styles.button}`} onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

function SignupModal({ onClose }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    email: '',
    phone_number: '',
    group_id: '',
    is_professor: false,
    is_admin: false,
    sex: '',
    birthdate: ''
  });

  const handleSignup = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        console.log('Signed up successfully');
        onClose();
      } else {
        console.error('Signup failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : (name === 'group_id' ? parseInt(value, 10) : value); // Convert group_id to number if applicable
    setFormData(prevData => ({
      ...prevData,
      [name]: newValue
    }));
  };
  

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={onClose}>&times;</span>
        <h2>Sign Up</h2>
        <input type="text" className={styles.inputFields} name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
        <input type="password" className={styles.inputFields} name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
        <input type="text" className={styles.inputFields} name="firstname" placeholder="First Name" value={formData.firstname} onChange={handleChange} />
        <input type="text" className={styles.inputFields} name="lastname" placeholder="Last Name" value={formData.lastname} onChange={handleChange} />
        <input type="email" className={styles.inputFields} name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <div className={styles.inputFields}>
              <label htmlFor="is_professor">Is Professor?</label>
              <input type="checkbox" name="is_professor" checked={formData.is_professor} onChange={handleChange} />
        </div>
        <div className={styles.inputFields}>
              <label htmlFor="is_admin">Is Admin?</label>
              <input type="checkbox" name="is_admin" checked={formData.is_admin} onChange={handleChange} />
        </div>
        <input type="text" className={styles.inputFields} name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} />
        <input type="text" className={styles.inputFields} name="group_id" placeholder="Group ID" value={formData.group_id} onChange={handleChange} />
        <input type="text" className={styles.inputFields} name="sex" placeholder="Sex" value={formData.sex} onChange={handleChange} />
        <input type="text" className={styles.inputFields} name="birthdate" placeholder="Birthdate: yyyy-mm-ddThh:mm:ssZ" value={formData.birthdate} onChange={handleChange} />
        <button className={`${styles.button}`} onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
}

const Home = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  return (
    <>
      <div className={styles.canvas}>
        <div className={styles.authButtons}>
          <button className={`${styles.button}`} onClick={() => { setShowSignupModal(true); setShowLoginModal(false); }}>Sign Up</button>
          <button className={`${styles.button}`} onClick={() => { setShowLoginModal(true); setShowSignupModal(false); }}>Login</button>
        </div>
      </div>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} />}
    </>
  );
};

export default Home;
