import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import groupsStyles from '../styles/Groups.module.css';
import Header from './components/Header';
import config from '../config/config';

interface Group {
  id: number;
  group_name: string;
}

const Groups: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [editGroupId, setEditGroupId] = useState<number | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const router = useRouter();

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

        fetchGroups(`http://${config.serverIP}:3000/api/list-groups`);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    const fetchGroups = async (url: string) => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const data = await response.json();
        setGroups(data.length ? data : null);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    checkUserRole();
  }, []);

  const handleAddGroup = async () => {
    try {
      const response = await fetch(`http://${config.serverIP}:3000/api/add-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ group_name: newGroupName }),
      });

      if (response.ok) {
        await response.json();
        setNewGroupName('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  const handleUpdateGroup = async () => {
    if (editGroupId !== null) {
      try {
        const response = await fetch(`http://${config.serverIP}:3000/api/update-group`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: editGroupId, group_name: editGroupName }),
        });

        if (response.ok) {
          await response.json();
          setEditGroupId(null);
          setEditGroupName('');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error updating group:', error);
      }
    }
  };

  const handleDeleteGroup = async (id: number) => {
    try {
      const response = await fetch(`http://${config.serverIP}:3000/api/delete-group?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        await response.json();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  return (
    <>
      <Header />
      <div className={groupsStyles.groupsContainer}>
        <h1>Группы</h1>
        {groups ? (
          <div className={groupsStyles.groupsListContainer}>
            <ul className={groupsStyles.groupsList}>
              {groups.map((group) => (
                <li key={group.id} className={groupsStyles.groupItem}>
                  <a
                    onClick={() => router.push(`/students-of-a-group/${group.id}`)}
                    href="#"
                    className={groupsStyles.groupLink}
                  >
                    {group.group_name}
                  </a>

                  {isAdmin && (
                    <>
                      <button
                        className={groupsStyles.editButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditGroupId(group.id);
                          setEditGroupName(group.group_name);
                        }}
                      >
                        Изменить
                      </button>
                      <button
                        className={groupsStyles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id);
                        }}
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
            <p>Нет доступных групп.</p>
            {isAdmin && (
              <div>
                <h2>Добавить группу</h2>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className={groupsStyles.inputField}
                />
                <button onClick={handleAddGroup} className={groupsStyles.addButton}>
                  Добавить
                </button>
              </div>
            )}
          </div>
        )}
        {isAdmin && editGroupId !== null && (
          <div>
            <h2>Изменить группу</h2>
            <input
              type="text"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              className={groupsStyles.inputField}
            />
            <button onClick={handleUpdateGroup} className={groupsStyles.updateButton}>
              Изменить
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Groups;
