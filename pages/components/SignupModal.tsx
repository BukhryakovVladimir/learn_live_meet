import React, { useState } from 'react';
import styles from '../../styles/Header.module.css';

const SignupModal = ({ onClose }: { onClose: () => void }) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
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
        <input
          type="text"
          className={styles.inputFields}
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="password"
          className={styles.inputFields}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          type="text"
          className={styles.inputFields}
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
        />
        <input
          type="text"
          className={styles.inputFields}
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
        />
        <input
          type="email"
          className={styles.inputFields}
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <div className={styles.inputFields}>
        <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>
        <input
          type="text"
          className={styles.inputFields}
          name="group_id"
          placeholder="Group ID"
          value={formData.group_id}
          onChange={handleChange}
        />
        <label>
          <input
            type="checkbox"
            name="is_professor"
            checked={formData.is_professor}
            onChange={handleChange}
          /> Professor
        </label>
        <label>
          <input
            type="checkbox"
            name="is_admin"
            checked={formData.is_admin}
            onChange={handleChange}
          /> Admin
        </label>
        <input
          type="text"
          className={styles.inputFields}
          name="sex"
          placeholder="Sex"
          value={formData.sex}
          onChange={handleChange}
        />
        <input
          type="date"
          className={styles.inputFields}
          name="birthdate"
          placeholder="Birthdate"
          value={formData.birthdate}
          onChange={handleChange}
        />
        <button className={styles.button} onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
};

export default SignupModal;

