import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Login credentials
  const defaultAdmin = 'admin';
  const defaultPass = 'admin123';

  // Entry State
  const [entries, setEntries] = useState([]);
  const [roomNo, setRoomNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerNo, setCustomerNo] = useState('');
  const [citizenshipNo, setCitizenshipNo] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [food, setFood] = useState('');
  const [totalBill, setTotalBill] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  
  // Edit State
  const [editId, setEditId] = useState(null);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem('hotelRecords');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
    const loggedStr = localStorage.getItem('isLoggedIn');
    if (loggedStr === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === defaultAdmin && password === defaultPass) {
      setIsLoggedIn(true);
      setLoginError('');
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    localStorage.setItem('isLoggedIn', 'false');
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.7)); // Compress as JPEG
      }
    };
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (base64) => {
        setPhotoBase64(base64);
      });
    }
  };

  const handleAddOrUpdateEntry = (e) => {
    e.preventDefault();
    if (!roomNo || !checkIn || !checkOut || !customerNo || !customerName) return;
    
    if (editId) {
      // Update existing
      const updated = entries.map(ent => {
        if (ent.id === editId) {
          return { ...ent, roomNo, customerName, customerNo, citizenshipNo, checkIn, checkOut, food, totalBill: totalBill || '0', photo: photoBase64 };
        }
        return ent;
      });
      setEntries(updated);
      localStorage.setItem('hotelRecords', JSON.stringify(updated));
      setEditId(null);
    } else {
      // Add new
      const newEntry = {
        id: Date.now(),
        roomNo,
        customerName,
        customerNo,
        citizenshipNo,
        checkIn,
        checkOut,
        food: food || 'None',
        totalBill: totalBill || '0',
        photo: photoBase64
      };
      const updated = [...entries, newEntry];
      setEntries(updated);
      localStorage.setItem('hotelRecords', JSON.stringify(updated));
    }
    
    // Reset fields
    setRoomNo('');
    setCustomerName('');
    setCustomerNo('');
    setCitizenshipNo('');
    setCheckIn('');
    setCheckOut('');
    setFood('');
    setTotalBill('');
    setPhotoBase64('');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (ent) => {
    setEditId(ent.id);
    setRoomNo(ent.roomNo || '');
    setCustomerName(ent.customerName || '');
    setCustomerNo(ent.customerNo || '');
    setCitizenshipNo(ent.citizenshipNo || '');
    setCheckIn(ent.checkIn || '');
    setCheckOut(ent.checkOut || '');
    setFood(ent.food || '');
    setTotalBill(ent.totalBill || '');
    setPhotoBase64(ent.photo || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setRoomNo('');
    setCustomerName('');
    setCustomerNo('');
    setCitizenshipNo('');
    setCheckIn('');
    setCheckOut('');
    setFood('');
    setTotalBill('');
    setPhotoBase64('');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this guest entry?")) {
      const updated = entries.filter(ent => ent.id !== id);
      setEntries(updated);
      localStorage.setItem('hotelRecords', JSON.stringify(updated));
    }
  };

  // Login View
  if (!isLoggedIn) {
    return (
      <div className="app-container">
        <div className="login-wrapper">
          <div className="glass-card">
            <h1 className="title">Namaste <span>Hotel</span></h1>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Admin Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Enter admin..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter admin123..."
                  required
                />
              </div>
              {loginError && <p style={{ color: '#e52b50', marginBottom: '1rem' }}>{loginError}</p>}
              <button type="submit" className="primary-btn">Sign In</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Filter entries based on search
  const filteredEntries = entries.filter(ent => {
    const roomStr = ent.roomNo ? String(ent.roomNo).toLowerCase() : '';
    const nameStr = ent.customerName ? String(ent.customerName).toLowerCase() : '';
    const custStr = ent.customerNo ? String(ent.customerNo).toLowerCase() : '';
    const searchStr = searchQuery ? searchQuery.toLowerCase() : '';
    return roomStr.includes(searchStr) || nameStr.includes(searchStr) || custStr.includes(searchStr);
  });

  // Dashboard View
  return (
    <div className="app-container">
      {/* Navbar Component */}
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>Namaste <span>Hotel</span></h1>
        </div>
        <div className="navbar-search">
          <input 
            type="text" 
            placeholder="Search by Room, Name, or Number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="navbar-actions">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        <main className="dashboard-content">
          <section className="add-entry-panel">
            <h2>{editId ? 'Edit Guest Record' : 'Guest Registration'}</h2>
            <form onSubmit={handleAddOrUpdateEntry}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Room Number</label>
                  <input type="text" value={roomNo} onChange={e => setRoomNo(e.target.value)} required placeholder="e.g. 101" />
                </div>
                <div className="form-group">
                  <label>Customer Name</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required placeholder="e.g. Ram Bahadur" />
                </div>
                <div className="form-group">
                  <label>Customer Mobile No</label>
                  <input type="tel" value={customerNo} onChange={e => setCustomerNo(e.target.value)} required placeholder="e.g. 9840000000" />
                </div>
                <div className="form-group">
                  <label>Citizenship Number</label>
                  <input type="text" value={citizenshipNo} onChange={e => setCitizenshipNo(e.target.value)} placeholder="e.g. 27-01-79-12345" />
                </div>
                <div className="form-group">
                  <label>Guest Photo</label>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} ref={fileInputRef} />
                  {photoBase64 && <img src={photoBase64} alt="Preview" style={{ marginTop: '10px', height: '60px', borderRadius: '5px', border: '1px solid #f7ca18' }} />}
                </div>
                <div className="form-group">
                  <label>Check-in Time</label>
                  <input type="datetime-local" value={checkIn} onChange={e => setCheckIn(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Checkout Time</label>
                  <input type="datetime-local" value={checkOut} onChange={e => setCheckOut(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Food Consumed</label>
                  <input type="text" value={food} onChange={e => setFood(e.target.value)} placeholder="e.g. Dal Bhat, Momos" />
                </div>
                <div className="form-group">
                  <label>Total Bill Amount (NPR)</label>
                  <input type="number" value={totalBill} onChange={e => setTotalBill(e.target.value)} placeholder="e.g. 2500" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="primary-btn" style={{ width: 'auto', padding: '1rem 3rem' }}>
                  {editId ? 'Update Entry' : 'Save Entry'}
                </button>
                {editId && (
                  <button type="button" onClick={handleCancelEdit} className="logout-btn" style={{ alignSelf: 'center' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="entries-list">
            <h2>Current Guest Log</h2>
            <div className="table-responsive">
              {filteredEntries.length === 0 ? (
                <div className="empty-state">No guests match your search.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Room</th>
                      <th>Name</th>
                      <th>Customer No</th>
                      <th>Citizenship No</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Food Record</th>
                      <th>Total Bill</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map(ent => (
                      <tr key={ent.id}>
                        <td>
                          {ent.photo ? (
                            <img src={ent.photo} alt="Guest" className="table-photo" />
                          ) : (
                            <div className="table-photo-placeholder">N/A</div>
                          )}
                        </td>
                        <td><strong>{ent.roomNo}</strong></td>
                        <td>{ent.customerName || 'N/A'}</td>
                        <td>{ent.customerNo}</td>
                        <td>{ent.citizenshipNo || 'N/A'}</td>
                        <td>{new Date(ent.checkIn).toLocaleString()}</td>
                        <td>{new Date(ent.checkOut).toLocaleString()}</td>
                        <td>{ent.food}</td>
                        <td style={{ color: '#f7ca18', fontWeight: 'bold' }}>NPR {Number(ent.totalBill).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleEdit(ent)} className="edit-btn">Edit</button>
                            <button onClick={() => handleDelete(ent.id)} className="delete-btn">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
