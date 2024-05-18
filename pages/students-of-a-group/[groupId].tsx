import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import studentsGroupStyles from '../../styles/StudentsGroup.module.css';
import Header from '../components/Header';

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
        const response = await fetch('http://localhost:3000/api/check-is-admin-or-professor', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

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
          `http://localhost:3000/api/list-students-of-a-group?group_id=${groupId}`,
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
        `http://localhost:3000/api/list-subjects-of-a-student?student_id=${studentId}`,
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
        `http://localhost:3000/api/list-grades-and-attendance-of-a-student-by-subject?student_id=${selectedStudentId}&subject_id=${subjectId}`,
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
        `http://localhost:3000/api/list-total-grades-of-a-student-by-subject?student_id=${selectedStudentId}&subject_id=${subjectId}`,
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
          'http://localhost:3000/api/insert-grade-and-attendance-of-a-student',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              student_id: selectedStudentId,
              subject_id: selectedSubjectId,
              grade: 1,
              has_attended: true,
            }),
          },
        );

        if (response.ok) {
          fetchGradesAndAttendance(selectedSubjectId);
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
          'http://localhost:3000/api/update-grade-and-attendance-of-a-student',
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              id,
              student_id: selectedStudentId,
              subject_id: selectedSubjectId,
              grade: 4,
              has_attended: true,
            }),
          },
        );

        if (response.ok) {
          fetchGradesAndAttendance(selectedSubjectId);
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
          `http://localhost:3000/api/delete-grade-and-attendance-of-a-student?id=${id}&student_id=${selectedStudentId}&subject_id=${selectedSubjectId}`,
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
        const response = await fetch('http://localhost:3000/api/insert-total-grade-of-a-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            student_id: selectedStudentId,
            subject_id: selectedSubjectId,
            grade: 'A',
          }),
        });

        if (response.ok) {
          fetchSemesterGrades(selectedSubjectId);
        }
      } catch (error) {
        console.error('Error adding semester grade:', error);
      }
    }
  };

  const handleUpdateSemesterGrade = async (id: number) => {
    if (isProfessor && selectedSubjectId !== null && selectedStudentId) {
      try {
        const response = await fetch('http://localhost:3000/api/update-total-grade-of-a-student', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id,
            student_id: selectedStudentId,
            subject_id: selectedSubjectId,
            grade: 'B',
          }),
        });

        if (response.ok) {
          fetchSemesterGrades(selectedSubjectId);
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
          `http://localhost:3000/api/delete-total-grade-of-a-student?id=${id}&student_id=${selectedStudentId}&subject_id=${selectedSubjectId}`,
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
      return <p>No grades</p>;
    }

    return (
      <ul className={studentsGroupStyles.subjectsList}>
        {gradesAndAttendance.map((grade) => (
          <li key={grade.id} className={studentsGroupStyles.subjectItem}>
            {grade.student_firstname} {grade.student_lastname} - Grade: {grade.grade}, Attended:{' '}
            {grade.has_attended ? 'Yes' : 'No'}
            {isProfessor && (
              <div className={studentsGroupStyles.subjectActions}>
                <button
                  onClick={() => handleUpdateGradeAttendance(grade.id)}
                  className={studentsGroupStyles.subjectButton}
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteGradeAttendance(grade.id)}
                  className={studentsGroupStyles.subjectButton}
                >
                  Delete
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
      return <p>No grades</p>;
    }

    return (
      <ul className={studentsGroupStyles.subjectsList}>
        {semesterGrades.map((grade) => (
          <li key={grade.id} className={studentsGroupStyles.subjectItem}>
            {grade.student_firstname} {grade.student_lastname} - Grade: {grade.grade}
            {isProfessor && (
              <div className={studentsGroupStyles.subjectActions}>
                <button
                  onClick={() => handleUpdateSemesterGrade(grade.id)}
                  className={studentsGroupStyles.subjectButton}
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteSemesterGrade(grade.id)}
                  className={studentsGroupStyles.subjectButton}
                >
                  Delete
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
        <h1>Students of group {groupId}</h1>
        <div>
          <label htmlFor="student-select">Select student:</label>
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
        </div>
        <div>
          <label htmlFor="subject-select">Select subject:</label>
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
        </div>
        <div>
          <button onClick={() => setCurrentView('grades-and-attendance')}>
            Grades and Attendance
          </button>
          <button onClick={() => setCurrentView('semester-grades')}>Semester Grades</button>
        </div>
        {currentView === 'grades-and-attendance' ? (
          <div>
            <h2>Grades and Attendance</h2>
            {renderGradeAttendance()}
            {isProfessor && (
              <button onClick={handleAddGradeAttendance} className={studentsGroupStyles.addButton}>
                Add Grade and Attendance
              </button>
            )}
          </div>
        ) : (
          <div>
            <h2>Semester Grades</h2>
            {renderSemesterGrades()}
            {isProfessor && (
              <button onClick={handleAddSemesterGrade} className={studentsGroupStyles.addButton}>
                Add Semester Grade
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default StudentsOfGroup;
