import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import style from '../styles/Grades.module.css';

interface Subject {
  id: number;
  subject_name: string;
}

interface GradeAttendance {
  subject_id: number;
  subject_name: string;
  grade: number;
  has_attended: boolean;
}

const Grades: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [gradesAndAttendance, setGradesAndAttendance] = useState<GradeAttendance[]>([]);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/check-is-admin-or-professor', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await response.json();
        setIsAdmin(data.is_admin);
        setIsProfessor(data.is_professor);
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!isAdmin && !isProfessor) {
        try {
          const response = await fetch('http://localhost:3000/api/list-current-user-subjects', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          const data = await response.json();
          setSubjects(data || []);
          if (data.length > 0) {
            setSelectedSubjectId(data[0].id);
          }
        } catch (error) {
          console.error('Error fetching subjects:', error);
        }
      }
    };

    fetchSubjects();
  }, [isAdmin, isProfessor]);

  useEffect(() => {
    const fetchGradesAndAttendance = async (subjectId: number) => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/list-current-user-grades-and-attendance-by-subject?subject_id=${subjectId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          },
        );
        const data = await response.json();
        setGradesAndAttendance(data || []);
      } catch (error) {
        console.error('Error fetching grades and attendance:', error);
      }
    };

    if (selectedSubjectId !== null) {
      fetchGradesAndAttendance(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const renderGradesAndAttendance = () => {
    if (!gradesAndAttendance || gradesAndAttendance.length === 0) {
      return <p>Нет оценок</p>;
    }

    return (
      <ul className={style.gradesList}>
        {gradesAndAttendance.map((grade, index) => (
          <li key={index} className={style.gradeItem}>
            {grade.subject_name} - Оценка: {grade.grade}, Присутствие: {grade.has_attended ? '+' : '-'}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <Header />
      <div className={style.gradesContainer}>
        <h1>Оценки</h1>
        {isAdmin && <p>Администраторы не имеют оценок</p>}
        {isProfessor && <p>Профессора не имеют оценок</p>}
        {!isAdmin && !isProfessor && (
          <>
            <div>
              <label htmlFor="subject-select">Дисциплина:</label>
              <select
                id="subject-select"
                value={selectedSubjectId || ''}
                onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                className={style.inputField}
              >
                <option value="" disabled>Выберите дисциплину</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>
            {subjects.length === 0 ? <p>Нет дисциплин</p> : renderGradesAndAttendance()}
          </>
        )}
      </div>
    </>
  );
};

export default Grades;
