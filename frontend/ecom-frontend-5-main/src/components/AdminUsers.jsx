import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Table, Badge, Spinner } from 'react-bootstrap';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const renderRoleBadges = (roles) => {
    return roles.map((role, index) => {
      const roleName = role.name.replace('ROLE_', '');
      const baseStyle = { borderRadius: '0px', letterSpacing: '1px', fontWeight: '900', fontSize: '10px' };
      
      // Industrial color coding
      let badgeBg = "secondary";
      if (roleName === 'ADMIN') badgeBg = "dark";
      if (roleName === 'USER') badgeBg = "light";

      return (
        <Badge key={index} bg={badgeBg} text={roleName === 'USER' ? 'dark' : 'white'} className={`me-1 text-uppercase border border-dark`} style={baseStyle}>
          {roleName}
        </Badge>
      );
    });
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="dark" />
      <p className="mt-3 Oswald-font fw-black text-uppercase">Scanning Database...</p>
    </div>
  );

  return (
    <div className="admin-users-container">
      <div className="d-flex justify-content-between align-items-end border-bottom border-dark pb-3 mb-4">
        <h3 className="fw-black text-uppercase mb-0 Oswald-font" style={{ letterSpacing: '1px' }}>
          User Directory
        </h3>
        <span className="Oswald-font fw-bold text-muted small text-uppercase">
          {users.length} Registered Members
        </span>
      </div>

      <div className="border border-dark bg-white">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-dark text-white">
            <tr className="Oswald-font small text-uppercase" style={{ letterSpacing: '1px' }}>
              <th className="ps-4 py-3 border-0">UID</th>
              <th className="border-0">Identity</th>
              <th className="border-0">Email</th>
              <th className="border-0">Clearance</th>
              <th className="text-center border-0 pe-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5 Oswald-font fw-bold text-muted text-uppercase">
                  Directory is currently empty.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="border-bottom border-light">
                  <td className="ps-4 fw-bold text-muted small">#{user.id.toString().padStart(4, '0')}</td>
                  <td>
                    <div className="d-flex align-items-center py-1">
                      <div className="border border-dark bg-dark text-white d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '32px', height: '32px' }}>
                        <span className="fw-black" style={{ fontSize: '12px' }}>{user.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="fw-black text-uppercase small Oswald-font">{user.username}</span>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${user.email}`} className="text-decoration-none text-dark fw-bold small">
                      {user.email}
                    </a>
                  </td>
                  <td>{renderRoleBadges(user.roles)}</td>
                  <td className="text-center pe-4">
                    <span className="fw-black text-uppercase Oswald-font text-success" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                      <i className="bi bi-record-fill me-1"></i>Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .Oswald-font { font-family: 'Oswald', sans-serif; }
        .table-hover tbody tr:hover {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;