import React, { useState, useEffect } from 'react';
import subjectsStyles from '../styles/Subjects.module.css';
import Header from './components/Header';
import Link from 'next/link';
import config from '../config/config';

interface Subject {
  id: number;
  subject_name: string;
}

const Subjects: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editSubjectId, setEditSubjectId] = useState<number | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch(`http://${config.serverIP}:3000/api/check-is-admin-or-professor`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const data = await response.json();
        setIsAdmin(data.is_admin);
        setIsProfessor(data.is_professor);

        const url = data.is_admin 
          ? `http://${config.serverIP}:3000/api/list-subjects` 
          : `http://${config.serverIP}:3000/api/list-current-user-subjects`;

        fetchSubjects(url);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    const fetchSubjects = async (url: string) => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const data = await response.json();
        setSubjects(data.length ? data : null);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    checkUserRole();
  }, []);

  const handleAddSubject = async () => {
    try {
      const response = await fetch(`http://${config.serverIP}:3000/api/add-subject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject_name: newSubjectName }),
      });

      if (response.ok) {
        await response.json();
        setNewSubjectName('');
        window.location.reload(); // Reload the page
      }
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleUpdateSubject = async () => {
    if (editSubjectId !== null) {
      try {
        const response = await fetch(`http://${config.serverIP}:3000/api/update-subject`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: editSubjectId, subject_name: editSubjectName }),
        });

        if (response.ok) {
          await response.json();
          setEditSubjectId(null);
          setEditSubjectName('');
          window.location.reload(); // Reload the page
        }
      } catch (error) {
        console.error('Error updating subject:', error);
      }
    }
  };

  const handleDeleteSubject = async (id: number) => {
    try {
      const response = await fetch(`http://${config.serverIP}:3000/api/delete-subject?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        await response.json();
        window.location.reload(); // Reload the page
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  return (
    <>
      <Header />
      <div className={subjectsStyles.subjectsContainer}>
        <h1>Занятия</h1>
        {subjects ? (
          <div className={subjectsStyles.subjectsListContainer}>
            <ul className={subjectsStyles.subjectsList}>
              {subjects.map((subject) => (
                <li key={subject.id} className={subjectsStyles.subjectItem}>
                  <Link href={`/rooms-of-a-subject/${subject.id}`}>{subject.subject_name}</Link>
                  {isAdmin && (
                    <>
                      <button
                        className={subjectsStyles.editButton}
                        onClick={() => {
                          setEditSubjectId(subject.id);
                          setEditSubjectName(subject.subject_name);
                        }}
                      >
                        Изменить
                      </button>
                      <button
                        className={subjectsStyles.deleteButton}
                        onClick={() => handleDeleteSubject(subject.id)}
                      >
                        Удалить
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <p>Нет доступных дисциплин.</p>
            {isAdmin && (
              <div>
                <h2>Добавить дисциплину</h2>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className={subjectsStyles.inputField}
                />
                <button onClick={handleAddSubject} className={subjectsStyles.addButton}>
                  Добавить
                </button>
              </div>
            )}
          </div>
        )}
        {isAdmin && editSubjectId !== null && (
          <div>
            <h2>Изменить дисциплину</h2>
            <input
              type="text"
              value={editSubjectName}
              onChange={(e) => setEditSubjectName(e.target.value)}
              className={subjectsStyles.inputField}
            />
            <button onClick={handleUpdateSubject} className={subjectsStyles.updateButton}>
              Изменить
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Subjects;
