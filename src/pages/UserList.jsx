import React, { useEffect, useState } from 'react';
import userApi from '../api/userApi';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userApi.getAll();
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <h2>User List</h2>
      <ul className="list-group">
        {users.map(user => (
          <li key={user.id} className="list-group-item">{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
