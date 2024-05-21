import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import studentsGroupStyles from '../../styles/StudentsGroup.module.css';
import Header from '../components/Header';
import config from '../../config/config';

interface Subject {
  id: number;
  subject_name: string;
}

interface Student {
  ID: number;
  username: string;
  firstName: string;
  lastName: string;
  group_id: number;
  sex: string;
  birthdate: string;
}

interface GradeAttendance {
  id: number;
  student_id: number;
  student_firstname: string;
  student_lastname: string;
  student_group_id: number;
  student_group_name: string;
  subject_id: number;
  subject_name: string;
  grade: number;
  has_attended: boolean;
}

interface SemesterGrade {
  id: number;
  student_id: number;
  student_firstname: string;
  student_lastname: string;
  student_group_id: number;
  student_group_name: string;
  subject_id: number;
  subject_name: string;
  grade: string;
}

const StudentsOfGroup: React.FC = () => {
  const [newGrade, setNewGrade] = useState(0);
  const [newHasAttended, setNewHasAttended] = useState(true);
  const [editGradeId, setEditGradeId] = useState<number | null>(null);
  const [editGrade, setEditGrade] = useState(0);
  const [editHasAttended, setEditHasAttended] = useState(true);

  const [newSemesterGrade, setNewSemesterGrade] = useState('');
  const [editSemesterGradeId, setEditSemesterGradeId] = useState<number | null>(null);
  const [editSemesterGrade, setEditSemesterGrade] = useState('');

  const router = useRouter();
  const { groupId } = router.query;
  const [isProfessor, setIsProfessor] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [gradesAndAttendance, setGradesAndAttendance] = useState<GradeAttendance[]>([]);
  const [semesterGrades, setSemesterGrades] = useState<SemesterGrade[]>([]);
  const [currentView, setCurrentView] = useState<'grades-and-attendance' | 'semester-grades'>(
    'grades-and-attendance',
  );

  useEffect(() => {
    const fetchUserRoleAndStudents = async () => {
      try {
        const response = await fetch(
          `http://${config.serverIP}:3000/api/check-is-admin-or-professor`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          },
        );

        const data = await response.json();
        setIsProfessor(data.is_professor);

        if (groupId) {
          fetchStudentsOfGroup(groupId as string);
        }
      } catch (error) {
        console.error('Error fetching user role or students:', error);
      }
    };

    const fetchStudentsOfGroup = async (groupId: string) => {
      try {
        const response = await fetch(
          `http://${config.serverIP}:3000/api/list-students-of-a-group?group_id=${groupId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          },
        );

        const data = await response.json();
        setStudents(data);
        if (data.length > 0) {
          setSelectedStudentId(data[0].ID);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchUserRoleAndStudents();
  }, [groupId]);

  useEffect(() => {
    if (selectedStudentId !== null) {
      fetchSubjectsOfStudent(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchSubjectsOfStudent = async (studentId: number) => {
    try {
      const response = await fetch(
        `http://${config.serverIP}:3000/api/list-subjects-of-a-student?student_id=${studentId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      );

      const data = await response.json();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubjectId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchGradesAndAttendance = async (subjectId: number) => {
    if (!selectedStudentId) return;
    try {
      const response = await fetch(
        `http://${config.serverIP}:3000/api/list-grades-and-attendance-of-a-student-by-subject?student_id=${selectedStudentId}&subject_id=${subjectId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      );

      const data = await response.json();
      setGradesAndAttendance(data);
    } catch (error) {
      console.error('Error fetching grades and attendance:', error);
    }
  };

  const fetchSemesterGrades = async (subjectId: number) => {
    if (!selectedStudentId) return;
    try {
      const response = await fetch(
        `http://${config.serverIP}:3000/api/list-total-grades-of-a-student-by-subject?student_id=${selectedStudentId}&subject_id=${subjectId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      );

      const data = await response.json();
      setSemesterGrades(data);
    } catch (error) {
      console.error('Error fetching semester grades:', error);
    }
  };

  useEffect(() => {
    if (selectedSubjectId !== null) {
      if (currentView === 'grades-and-attendance') {
        fetchGradesAndAttendance(selectedSubjectId);
      } else {
        fetchSemesterGrades(selectedSubjectId);
      }
    }
  }, [selectedSubjectId, currentView]);

  const handleAddGradeAttendance = async () => {
    if (isProfessor && selectedSubjectId !== null && selectedStudentId) {
      try {
        const response = await fetch(
          `http://${config.serverIP}:3000/api/insert-grade-and-attendance-of-a-student`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              student_id: selectedStudentId,
              subject_id: selectedSubjectId,
              grade: newGrade,
              has_attended: newHasAttended,
            }),
          },
        );

        if (response.ok) {
          fetchGradesAndAttendance(selectedSubjectId);
          setNewGrade(0); // Reset the new grade input
          setNewHasAttended(true); // Reset the new attendance input
        }
      } catch (error) {
        console.error('Error adding grade and attendance:', error);
      }
    }
  };

  const handleUpdateGradeAttendance = async (id: number) => {
    if (isProfessor && selectedSubjectId !== null && selectedStudentId) {
      try {
        const response = await fetch(
          `http://${config.serverIP}:3000/api/update-grade-and-attendance-of-a-student`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              id,
              student_id: selectedStudentId,
              subject_id: selectedSubjectId,
              grade: editGrade,
              has_attended: editHasAttended,
            }),
          },
        );

        if (response.ok) {
          fetchGradesAndAttendance(selectedSubjectId);
          setEditGradeId(null); // Exit edit mode
          setEditGrade(0); // Reset the edit grade input
          setEditHasAttended(true); // Reset the edit attendance input
        }
      } catch (error) {
        console.error('Error updating grade and attendance:', error);
      }
    }
  };

  const handleDeleteGradeAttendance = async (id: number) => {
    if (isProfessor && selectedSubjectId !== null && selectedStudentId) {
      try {
        const response = await fetch(
          `http://${config.serverIP}:3000/api/delete-grade-and-attendance-of-a-student?id=${id}&student_id=${selectedStudentId}&subject_id=${selectedSubjectId}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          },
        );

        if (response.ok) {
          fetchGradesAndAttendance(selectedSubjectId);
        }
      } catch (error) {
        console.error('Error deleting grade and attendance:', error);
      }
    }
  };

  const handleAddSemesterGrade = async () => {
    if (isProfessor && selectedSubjectId !== null && selectedStudentId) {
      try {
        const response = await fetch(
          `http://${config.serverIP}:3000/api/insert-total-grade-of-a-student`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              student_id: selectedStudentId,
              subject_id: selectedSubjectId,
              grade: newSemesterGrade,
            }),
          },
        );

        if (response.ok) {
          fetchSemesterGrades(selectedSubjectId);
          setNewSemesterGrade(''); // Reset the new semester grade input
        }
      } catch (error) {
        console.error('Error adding semester grade:', error);
      }
    }
  };

  const handleUpdateSemesterGrade = async (id: number) => {
    if (isProfessor && selectedSubjectId !== null && selectedStudentId) {
      try {
        const response = await fetch(
          `http://${config.serverIP}:3000/api/update-total-grade-of-a-student`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              id,
              student_id: selectedStudentId,
              subject_id: selectedSubjectId,
              grade: editSemesterGrade,
            }),
          },
        );

        if (response.ok) {
          fetchSemesterGrades(selectedSubjectId);
          setEditSemesterGradeId(null); // Exit edit mode
          setEditSemesterGrade(''); // Reset the edit semester grade input
        }
      } catch (error) {
        console.error('Error updating semester grade:', error);
      }
    }
  };

  const handleDeleteSemesterGrade = async (id: number) => {
    if (isProfessor && selectedSubjectId !== null && selectedStudentId) {
      try {
        const response = await fetch(
          `http://${config.serverIP}:3000/api/delete-total-grade-of-a-student?id=${id}&student_id=${selectedStudentId}&subject_id=${selectedSubjectId}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          },
        );

        if (response.ok) {
          fetchSemesterGrades(selectedSubjectId);
        }
      } catch (error) {
        console.error('Error deleting semester grade:', error);
      }
    }
  };

  const renderGradeAttendance = () => {
    if (!gradesAndAttendance || gradesAndAttendance.length === 0) {
      return <p>Нет оценок</p>;
    }

    return (
      <ul className={studentsGroupStyles.subjectsList}>
        {gradesAndAttendance.map((grade) => (
          <li key={grade.id} className={studentsGroupStyles.subjectItem}>
            {grade.student_firstname} {grade.student_lastname} - Оценка: {grade.grade}, Присутствие:{' '}
            {grade.has_attended ? '+' : '-'}
            {isProfessor && (
              <div className={studentsGroupStyles.subjectActions}>
                <button
                  onClick={() => {
                    setEditGradeId(grade.id);
                    setEditGrade(grade.grade);
                    setEditHasAttended(grade.has_attended);
                  }}
                  className={studentsGroupStyles.subjectButton}
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDeleteGradeAttendance(grade.id)}
                  className={studentsGroupStyles.subjectButton}
                >
                  Удалить
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  const renderSemesterGrades = () => {
    if (!semesterGrades || semesterGrades.length === 0) {
      return <p>Нет оценок</p>;
    }

    return (
      <ul className={studentsGroupStyles.subjectsList}>
        {semesterGrades.map((grade) => (
          <li key={grade.id} className={studentsGroupStyles.subjectItem}>
            {grade.student_firstname} {grade.student_lastname} - Оценка: {grade.grade}
            {isProfessor && (
              <div className={studentsGroupStyles.subjectActions}>
                <button
                  onClick={() => {
                    setEditSemesterGradeId(grade.id);
                    setEditSemesterGrade(grade.grade);
                  }}
                  className={studentsGroupStyles.subjectButton}
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDeleteSemesterGrade(grade.id)}
                  className={studentsGroupStyles.subjectButton}
                >
                  Удалить
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <Header />
      <div className={studentsGroupStyles.container}>
        <h1>Студенты группы: {groupId}</h1>
        <div>
          <label htmlFor="student-select">Студент:</label>
          {students !== null ? (
            <select
              id="student-select"
              value={selectedStudentId || ''}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
            >
              {students.map((student) => (
                <option key={student.ID} value={student.ID}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          ) : (
            <p>Нет студентов</p>
          )}
        </div>
        <div>
          <label htmlFor="subject-select">Дисциплина:</label>
          {subjects !== null ? (
            <select
              id="subject-select"
              value={selectedSubjectId || ''}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          ) : (
            <p>Нет дисциплин</p>
          )}
        </div>
        <div>
          <button onClick={() => setCurrentView('grades-and-attendance')}>
            Оценки и посещаемость
          </button>
          <button onClick={() => setCurrentView('semester-grades')}>Оценки за семестры</button>
        </div>
        {currentView === 'grades-and-attendance' ? (
          <div>
            <h2>Оценки и посещаемость</h2>
            {renderGradeAttendance()}
            {isProfessor && (
              <>
                <input
                  type="number"
                  value={newGrade}
                  onChange={(e) => setNewGrade(Number(e.target.value))}
                  className={studentsGroupStyles.inputField}
                  placeholder="Оценка"
                />
                <select
                  value={newHasAttended}
                  onChange={(e) => setNewHasAttended(e.target.value === 'true')}
                >
                  <option value="true">Присутствует</option>
                  <option value="false">Отсутствует</option>
                </select>
                <button
                  onClick={handleAddGradeAttendance}
                  className={studentsGroupStyles.addButton}
                >
                  Добавить оценку и присутствие
                </button>
                {editGradeId !== null && (
                  <>
                    <input
                      type="number"
                      value={editGrade}
                      onChange={(e) => setEditGrade(Number(e.target.value))}
                      className={studentsGroupStyles.inputField}
                      placeholder="Оценка"
                    />
                    <select
                      value={editHasAttended}
                      onChange={(e) => setEditHasAttended(e.target.value === 'true')}
                    >
                      <option value="true">Присутствует</option>
                      <option value="false">Отсутствует</option>
                    </select>
                    <button
                      onClick={() => handleUpdateGradeAttendance(editGradeId)}
                      className={studentsGroupStyles.updateButton}
                    >
                      Изменить оценку и присутствие
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            <h2>Семестровые оценки</h2>
            {renderSemesterGrades()}
            {isProfessor && (
              <>
                <input
                  type="text"
                  value={newSemesterGrade}
                  onChange={(e) => setNewSemesterGrade(e.target.value)}
                  className={studentsGroupStyles.inputField}
                  placeholder="Оценка"
                />
                <button onClick={handleAddSemesterGrade} className={studentsGroupStyles.addButton}>
                  Добавить семестровую оценку
                </button>
                {editSemesterGradeId !== null && (
                  <>
                    <input
                      type="text"
                      value={editSemesterGrade}
                      onChange={(e) => setEditSemesterGrade(e.target.value)}
                      className={studentsGroupStyles.inputField}
                      placeholder="Оценка"
                    />
                    <button
                      onClick={() => handleUpdateSemesterGrade(editSemesterGradeId)}
                      className={studentsGroupStyles.updateButton}
                    >
                      Изменить семестровую оценку
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default StudentsOfGroup;
