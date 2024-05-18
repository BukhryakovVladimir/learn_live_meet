import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import roomsStyles from '../../styles/Rooms.module.css';
import Header from '../components/Header';

interface Room {
  id: number;
  subject_id: number;
  subject_name: string;
  room_name: string;
}

const Rooms: React.FC = () => {
  const router = useRouter();
  const { subjectId } = router.query;

  const [isAdmin, setIsAdmin] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [editRoomId, setEditRoomId] = useState<number | null>(null);
  const [editRoomName, setEditRoomName] = useState('');

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/check-is-admin-or-professor', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.is_admin);
        }
      } catch (error) {
        console.error('Error fetching admin status:', error);
      }
    };

    const fetchRooms = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/list-rooms-of-a-subject?subject_id=${subjectId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          },
        );

        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    checkAdminStatus();
    if (subjectId) {
      fetchRooms();
    }
  }, [subjectId]);

  const handleAddRoom = async () => {
    try {
      const parsedSubjectId = parseInt(subjectId);
      const response = await fetch('http://localhost:3000/api/add-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject_id: parsedSubjectId, room_name: newRoomName }),
      });

      if (response.ok) {
        await response.json();
        setNewRoomName('');
        window.location.reload(); // Reload the page
      }
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const handleUpdateRoom = async () => {
    if (editRoomId !== null) {
      try {
        const response = await fetch('http://localhost:3000/api/update-room', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: editRoomId, subject_id: subjectId, room_name: editRoomName }),
        });

        if (response.ok) {
          await response.json();
          setEditRoomId(null);
          setEditRoomName('');
          window.location.reload(); // Reload the page
        }
      } catch (error) {
        console.error('Error updating room:', error);
      }
    }
  };

  const handleDeleteRoom = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/delete-room?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        await response.json();
        window.location.reload(); // Reload the page
      }
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const handleRoomClick = async (roomId: number, router: any) => {
    try {
      const response = await fetch(`http://localhost:3000/api/get-token?room_id=${roomId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
  
      if (response.ok) {
        const token = await response.json(); // Parse JSON response
        console.log('Token:', token);
  
        if (token) {
          const serverUrl = 'ws://localhost:7880';
          console.log(`/custom/?liveKitUrl=${serverUrl}&token=${token}`);
          router.push(`/custom/?liveKitUrl=${serverUrl}&token=${token}`);
        } else {
          console.error('Token is undefined or empty.');
        }
      } else {
        console.error('Response not okay:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };
  

  return (
    <>
      <Header />
      <div className={roomsStyles.roomsContainer}>
        <h1>Комнаты дисциплины: </h1>
        {rooms && rooms[0] && <h1>{rooms[0].subject_name}</h1>}
        <h2>ID Дисциплины: {subjectId}</h2>
        {isAdmin && (
          <div className={roomsStyles.addRoomContainer}>
            <h2>Добавить комнату</h2>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className={roomsStyles.inputField}
            />
            <button onClick={handleAddRoom} className={roomsStyles.addButton}>
              Добавить комнату
            </button>
          </div>
        )}
        {rooms && rooms.length > 0 && (
          <ul className={roomsStyles.roomsList}>
            {rooms.map((room) => (
              <li key={room.id} className={roomsStyles.roomItem}>
                <a
                  onClick={() => handleRoomClick(room.id, router)}
                  href="#"
                  className={roomsStyles.roomLink}
                >
                  {room.room_name}
                </a>
                {isAdmin && (
                  <div className={roomsStyles.roomActions}>
                    <button
                      onClick={() => {
                        setEditRoomId(room.id);
                        setEditRoomName(room.room_name);
                      }}
                      className={roomsStyles.editButton}
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className={roomsStyles.deleteButton}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {editRoomId !== null && (
          <div className={roomsStyles.editRoomContainer}>
            <h2>Edit Room</h2>
            <input
              type="text"
              value={editRoomName}
              onChange={(e) => setEditRoomName(e.target.value)}
              className={roomsStyles.inputField}
            />
            <button onClick={handleUpdateRoom} className={roomsStyles.updateButton}>
              Изменить комнату
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Rooms;
