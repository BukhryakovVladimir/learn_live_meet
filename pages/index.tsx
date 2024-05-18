import React from 'react';
import styles from '../styles/Home.module.css';
import Header from './components/Header';

const Home: React.FC = () => {
  return (
    <div className={styles.canvas}>
      <Header />
      <div className={styles.main}>
        <h1>Welcome to the Home Page</h1>
      </div>
    </div>
  );
};

export default Home;
