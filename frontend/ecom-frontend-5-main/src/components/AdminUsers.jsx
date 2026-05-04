import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Table, Badge, Spinner, Card } from 'react-bootstrap';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetches all registered users via the protected Admin endpoint
    axios.get('/admin/users')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching admin users:", err);
        setLoading(false);
      });
  }, []);

  // Helper to render distinct badges for different roles
  const renderRoleBadges = (roles) => {
    return roles.map((role, index) => {
      const roleName = role.name.replace('ROLE_', '');
      let badgeBg = "secondary";
      
      if (roleName === 'ADMIN') badgeBg = "danger";
      if (roleName === 'USER') badgeBg = "info";

      return (
        <Badge key={index} bg={badgeBg} className="me-1 fw-normal rounded-pill px-3">
          {roleName}
        </Badge>
      );
    });
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted">Retrieving user directory...</p>
    </div>
  );

  return (
    <div className="admin-users-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Registered Users</h3>
        <Badge bg="dark" className="p-2 px-3 rounded-pill">Total Members: {users.length}</Badge>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="table-light">
            <tr className="text-muted small text-uppercase">
              <th className="ps-4">User ID</th>
              <th>Identity</th>
              <th>Email Address</th>
              <th>Access Level</th>
              <th className="text-center">Account Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">No users found in the system.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td className="ps-4 text-muted">#{user.id.toString().padStart(4, '0')}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '40px', height: '40px' }}>
                        <i className="bi bi-person text-primary"></i>
                      </div>
                      <span className="fw-bold text-dark">{user.username}</span>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${user.email}`} className="text-decoration-none text-muted">
                      {user.email}
                    </a>
                  </td>
                  <td>{renderRoleBadges(user.roles)}</td>
                  <td className="text-center">
                    <span className="text-success small fw-bold">
                      <i className="bi bi-check-circle-fill me-1"></i> Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminUsers;