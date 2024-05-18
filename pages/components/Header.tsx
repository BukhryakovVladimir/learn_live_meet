import React, { useState, useEffect } from 'react';
import styles from '../../styles/Header.module.css';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Dynamic imports with no SSR
const LoginModal = dynamic(() => import('./LoginModal'), { ssr: false });
const SignupModal = dynamic(() => import('./SignupModal'), { ssr: false });

const Header: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminOrProfessor = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/check-is-admin-or-professor', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setIsAdmin(data.is_admin);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setIsLoggedIn(false);
      }
    };

    checkAdminOrProfessor();
  }, []);

  const handleLogout = () => {
    // Clear the JWT cookie
    document.cookie = "learn_live_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api; domain=localhost;";
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.reload(); // Reload using window.location
  };

  const handleNavigation = (view: string) => {
    router.push(view); // Navigate to the specified view
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.authButtons}>
        {!isLoggedIn && <button className={styles.button} onClick={() => setShowLoginModal(true)}>Войти</button>}
        {isAdmin && <button className={styles.button} onClick={() => setShowSignupModal(true)}>Регистрация</button>}
        {isLoggedIn && <button className={styles.button} onClick={handleLogout}>Выйти</button>}
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} />}

      <nav className={styles.navbar}>
        <a href="#" className={styles.navlink} onClick={(e) => { e.preventDefault(); handleNavigation('/subjects'); }}>Занятия</a>
        <a href="#" className={styles.navlink} onClick={(e) => { e.preventDefault(); handleNavigation('/groups'); }}>Группы</a>
        <a href="#" className={styles.navlink} onClick={(e) => { e.preventDefault(); handleNavigation('/grades'); }}>Оценки</a>
        <a href="#" className={styles.navlink} onClick={(e) => { e.preventDefault(); handleNavigation('/grades-for-semester'); }}>Оценки за семестры</a>
      </nav>
    </div>
  );
};

export default Header;
