import React, { useState } from 'react';
import styles from '../../styles/Header.module.css';
import config from '../../config/config';

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
      const response = await fetch(`http://${config.serverIP}:3000/api/signup`, {
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
        <h3>Регистрация</h3>
        <input
          type="text"
          className={styles.inputFields}
          name="username"
          placeholder="Имя пользователя"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="password"
          className={styles.inputFields}
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          type="text"
          className={styles.inputFields}
          name="firstname"
          placeholder="Имя"
          value={formData.firstname}
          onChange={handleChange}
        />
        <input
          type="text"
          className={styles.inputFields}
          name="lastname"
          placeholder="Фамилия"
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
            placeholder="Номер телефона"
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>
        <input
          type="text"
          className={styles.inputFields}
          name="group_id"
          placeholder="ID группы"
          value={formData.group_id}
          onChange={handleChange}
        />
        <input
          type="text"
          className={styles.inputFields}
          name="sex"
          placeholder="Пол"
          value={formData.sex}
          onChange={handleChange}
        />
        <input
          type="date"
          className={styles.inputFields}
          name="birthdate"
          placeholder="Дата рождения"
          value={formData.birthdate}
          onChange={handleChange}
        />
        <label>
        Профессор?
          <input
            type="checkbox"
            name="is_professor"
            checked={formData.is_professor}
            onChange={handleChange}
          /> 
        </label>
        <label>
        Админ?
          <input
            type="checkbox"
            name="is_admin"
            checked={formData.is_admin}
            onChange={handleChange}
          /> 
        </label>
        <button className={styles.button} onClick={handleSignup}>Регистрация</button>
      </div>
    </div>
  );
};

export default SignupModal;

