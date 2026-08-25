import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, ShieldAlert, LogOut, Database, Users, Calendar, 
  Image as ImageIcon, Mail, Plus, Edit, Trash2, X, 
  Upload, Download, Eye, EyeOff
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export default function AdminDashboard() {
  const {
    committee, festivals, albums, photos, messages,
    addCommitteeMember, updateCommitteeMember, deleteCommitteeMember,
    addCommunityFestival, updateCommunityFestival, deleteCommunityFestival,
    addPhotoAlbum, updatePhotoAlbum, deletePhotoAlbum,
    addPhotosToAlbum, updateAlbumPhoto, deleteAlbumPhoto,
    toggleMessageRead, removeMessage, backupDB, restoreDB
  } = useDatabase();

  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('bayanapalli_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin Navigation Tab
  const [activeTab, setActiveTab] = useState('overview');

  // Form Management States
  const [editingItem, setEditingItem] = useState(null); // stores { type: 'member'|'festival'|'album', data: {...} } or null
  const [isAdding, setIsAdding] = useState(false); // flags when adding new item

  // Image Upload helper storage
  const [uploadedImageBase64, setUploadedImageBase64] = useState('');
  const fileInputRef = useRef(null);

  // Message Detail Viewer Modal
  const [activeMessage, setActiveMessage] = useState(null);

  // Form Input Refs/States
  // 1. Committee Form
  const [memberForm, setMemberForm] = useState({
    name: '', role: 'Committee Member', description: '',
    status: 'current', startYear: new Date().getFullYear(), endYear: ''
  });

  // 2. Festival Form
  const [festivalForm, setFestivalForm] = useState({
    name: '', year: new Date().getFullYear(), date: new Date().toISOString().slice(0, 10),
    location: '', description: '', type: 'cultural'
  });

  // 3. Album Form
  const [albumForm, setAlbumForm] = useState({
    festivalId: '', name: '', year: new Date().getFullYear(), description: ''
  });

  // 4. Photo Form
  const [photoForm, setPhotoForm] = useState({
    albumId: '', caption: '', photographer: '', 
    date: new Date().toISOString().slice(0,10), location: ''
  });
  const [bulkPhotoUrls, setBulkPhotoUrls] = useState(''); // Textarea input for URL list (one per line)

  // --- Auth Handlers ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('bayanapalli_admin_auth', 'true');
      setLoginError('');
      setPasscode('');
    } else {
      setLoginError('Invalid Administrator Passcode.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('bayanapalli_admin_auth');
    setActiveTab('overview');
  };

  // Helper: Image compression via HTML5 Canvas
  const compressImageFile = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // --- Image Reader & Auto-Compressor ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Only image files (.jpg, .jpeg, .png, .webp) are supported.");
      e.target.value = '';
      return;
    }

    try {
      const compressedBase64 = await compressImageFile(file);
      if (compressedBase64) {
        setUploadedImageBase64(compressedBase64);
      }
    } catch (err) {
      console.error("Image compression error:", err);
    }
  };

  // --- Database Backup Import ---
  const handleImportDB = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const success = await restoreDB(event.target.result);
      if (success) {
        alert("Database restored successfully!");
      } else {
        alert("Restore failed. Please check the integrity of the JSON backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- CRUD Actions ---

  // A. Committee Actions
  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !memberForm.description.trim()) {
      alert("Please fill in the name and description fields.");
      return;
    }

    // Set image path (uploaded file or default placeholder)
    const photoUrl = uploadedImageBase64 || 
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop"; // fallback portrait

    const payload = {
      ...memberForm,
      photo: photoUrl,
      startYear: parseInt(memberForm.startYear),
      endYear: memberForm.status === 'former' ? parseInt(memberForm.endYear) : null
    };

    if (editingItem) {
      await updateCommitteeMember(editingItem.data.id, payload);
    } else {
      await addCommitteeMember(payload);
    }

    resetFormState();
  };

  const handleEditMember = (m) => {
    setEditingItem({ type: 'member', data: m });
    setUploadedImageBase64(m.photo.startsWith('data:image') ? m.photo : '');
    setMemberForm({
      name: m.name,
      role: m.role,
      description: m.description,
      status: m.status,
      startYear: m.startYear,
      endYear: m.endYear || ''
    });
    setIsAdding(true);
  };

  // B. Festival Actions
  const handleSaveFestival = async (e) => {
    e.preventDefault();
    if (!festivalForm.name.trim() || !festivalForm.location.trim()) {
      alert("Please fill in the name and location fields.");
      return;
    }

    const cover = uploadedImageBase64 || 
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&fit=crop"; // fallback banner

    const payload = {
      ...festivalForm,
      coverImage: cover
    };

    if (editingItem) {
      await updateCommunityFestival(editingItem.data.id, payload);
    } else {
      await addCommunityFestival(payload);
    }

    resetFormState();
  };

  const handleEditFestival = (f) => {
    setEditingItem({ type: 'festival', data: f });
    setUploadedImageBase64(f.coverImage.startsWith('data:image') ? f.coverImage : '');
    setFestivalForm({
      name: f.name,
      year: f.year,
      date: f.date,
      location: f.location,
      description: f.description,
      type: f.type
    });
    setIsAdding(true);
  };

  // C. Album Actions
  const handleSaveAlbum = async (e) => {
    e.preventDefault();
    if (!albumForm.name.trim() || !albumForm.festivalId) {
      alert("Please select a Festival and enter an Album title.");
      return;
    }

    if (editingItem) {
      await updatePhotoAlbum(editingItem.data.id, albumForm);
    } else {
      await addPhotoAlbum(albumForm);
    }
    resetFormState();
  };

  // D. Media Upload Actions
  const handleUploadPhotos = async (e) => {
    e.preventDefault();
    if (!photoForm.albumId) {
      alert("Please select an Album to upload photos to.");
      return;
    }

    const photoEntries = [];

    // Option 1: File selection
    if (uploadedImageBase64) {
      photoEntries.push({
        albumId: photoForm.albumId,
        url: uploadedImageBase64,
        caption: photoForm.caption || 'Community Memory',
        photographer: photoForm.photographer || 'Trust Trustee',
        date: photoForm.date,
        location: photoForm.location || 'HQ'
      });
    }

    // Option 2: Bulk URLs
    if (bulkPhotoUrls.trim()) {
      const urls = bulkPhotoUrls.split('\n').map(u => u.trim()).filter(Boolean);
      urls.forEach(url => {
        photoEntries.push({
          albumId: photoForm.albumId,
          url: url,
          caption: photoForm.caption || 'Community Photo',
          photographer: photoForm.photographer || 'Trust Trustee',
          date: photoForm.date,
          location: photoForm.location || 'HQ'
        });
      });
    }

    if (photoEntries.length === 0) {
      alert("Please select a photo file or enter image URLs to save.");
      return;
    }

    await addPhotosToAlbum(photoEntries);
    resetFormState();
    alert(`Successfully loaded ${photoEntries.length} photos!`);
  };

  // E. Reset forms
  const resetFormState = () => {
    setEditingItem(null);
    setIsAdding(false);
    setUploadedImageBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    setMemberForm({
      name: '', role: 'Committee Member', description: '',
      status: 'current', startYear: new Date().getFullYear(), endYear: ''
    });
    setFestivalForm({
      name: '', year: new Date().getFullYear(), date: new Date().toISOString().slice(0, 10),
      location: '', description: '', type: 'cultural'
    });
    setAlbumForm({
      festivalId: '', name: '', year: new Date().getFullYear(), description: ''
    });
    setPhotoForm({
      albumId: '', caption: '', photographer: '', 
      date: new Date().toISOString().slice(0,10), location: ''
    });
    setBulkPhotoUrls('');
  };

  // Helper selectors
  const totalSubmissions = messages.length;
  const unreadCount = messages.filter(m => !m.readStatus).length;

  return (
    <div className="admin-page-wrapper section container animate-fade-in-up">
      
      {/* 1. Login Barrier screen */}
      {!isAuthenticated ? (
        <div className="admin-login-barrier">
          <div className="admin-login-card">
            <div className="admin-lock-icon">
              <ShieldAlert size={32} />
            </div>
            <h2>Administrative Login</h2>
            <p>Access is restricted to authorized trustees and community web managers.</p>
            
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="passcode">Access Passcode</label>
                <input
                  type="password"
                  id="passcode"
                  className="form-control"
                  placeholder="Enter admin passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                />
              </div>
              {loginError && <div className="form-error-msg" style={{ marginBottom: '14px' }}>{loginError}</div>}
              
              <button type="submit" className="btn btn-primary btn-block">
                Authorize Access
              </button>
            </form>
            <div className="admin-tip-footer">
              Default passcode for review: <code>admin123</code>
            </div>
          </div>
        </div>
      ) : (
        
        /* 2. Admin Dashboard Layout */
        <div className="admin-dashboard-container">
          
          {/* Main Top Header */}
          <div className="admin-top-menu">
            <div className="admin-profile-badge">
              <div className="admin-icon-circle"><ShieldCheck size={20} /></div>
              <div>
                <h3>Trust Administrator</h3>
                <span>Digital Database Manager Mode</span>
              </div>
            </div>
            <button className="btn btn-sm btn-outline" onClick={handleLogout} style={{ border: 'none' }}>
              <LogOut size={16} style={{ marginRight: '4px' }} /> Log Out
            </button>
          </div>

          {/* Navigation and workspace split */}
          <div className="admin-workspace">
            {/* Left sidebar nav tabs */}
            <aside className="admin-sidebar">
              <ul className="sidebar-tabs">
                <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => { setActiveTab('overview'); resetFormState(); }}>
                  <Database size={16} /> Overview & Tools
                </li>
                <li className={activeTab === 'members' ? 'active' : ''} onClick={() => { setActiveTab('members'); resetFormState(); }}>
                  <Users size={16} /> Committee Directory
                </li>
                <li className={activeTab === 'festivals' ? 'active' : ''} onClick={() => { setActiveTab('festivals'); resetFormState(); }}>
                  <Calendar size={16} /> Festivals Timeline
                </li>
                <li className={activeTab === 'gallery' ? 'active' : ''} onClick={() => { setActiveTab('gallery'); resetFormState(); }}>
                  <ImageIcon size={16} /> Gallery & Albums
                </li>
                <li className={activeTab === 'messages' ? 'active' : ''} onClick={() => { setActiveTab('messages'); resetFormState(); }}>
                  <Mail size={16} /> Messages Inbox {unreadCount > 0 && <span className="unread-counter-badge">{unreadCount}</span>}
                </li>
              </ul>
            </aside>

            {/* Right Work Panel */}
            <main className="admin-main-panel">
              
              {/* TAB 1: OVERVIEW & BACKUP */}
              {activeTab === 'overview' && (
                <div className="admin-overview-tab">
                  <h2>Portal Dashboard Overview</h2>
                  <p style={{ color: 'var(--text-medium)', marginBottom: '30px' }}>
                    Welcome to the admin control panel. You can modify members, festivals, and pictures without altering the codebase. Changes save locally and can be backed up as JSON files.
                  </p>

                  <div className="quick-stats-grid">
                    <div className="q-stat">
                      <span>Total Members</span>
                      <h3>{committee.length}</h3>
                    </div>
                    <div className="q-stat">
                      <span>Festivals</span>
                      <h3>{festivals.length}</h3>
                    </div>
                    <div className="q-stat">
                      <span>Albums</span>
                      <h3>{albums.length}</h3>
                    </div>
                    <div className="q-stat">
                      <span>Photographs</span>
                      <h3>{photos.length}</h3>
                    </div>
                  </div>

                  <div className="database-utilities-card">
                    <h3>Database Backup Utility</h3>
                    <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      Maintain database safety. Export the entire structure to download a copy. In case of browser reset, upload the backup file to restore.
                    </p>
                    <div className="utilities-btn-group">
                      <button className="btn btn-primary" onClick={backupDB}>
                        <Download size={16} /> Backup Database (Export JSON)
                      </button>
                      <label className="btn btn-outline" style={{ display: 'inline-flex', gap: '8px', cursor: 'pointer' }}>
                        <Upload size={16} /> Restore Database (Import JSON)
                        <input 
                          type="file" 
                          accept=".json" 
                          style={{ display: 'none' }} 
                          onChange={handleImportDB}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MEMBERS DIRECTORY */}
              {activeTab === 'members' && (
                <div className="admin-crud-panel">
                  <div className="crud-header">
                    <h2>Manage Committee Profiles</h2>
                    {!isAdding && (
                      <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(true)}>
                        <Plus size={16} /> Add Member
                      </button>
                    )}
                  </div>

                  {isAdding ? (
                    /* Member Form */
                    <form className="crud-form-card" onSubmit={handleSaveMember}>
                      <h3>{editingItem ? 'Edit Member details' : 'Add New Member'}</h3>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={memberForm.name}
                          onChange={e => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="form-row-2">
                        <div className="form-group">
                          <label className="form-label">Designation / Role</label>
                          <input
                            type="text"
                            className="form-control"
                            value={memberForm.role}
                            onChange={e => setMemberForm(prev => ({ ...prev, role: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Status</label>
                          <select
                            className="form-control"
                            value={memberForm.status}
                            onChange={e => setMemberForm(prev => ({ ...prev, status: e.target.value }))}
                          >
                            <option value="current">Current Board</option>
                            <option value="former">Former Member</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label className="form-label">Service Start Year</label>
                          <input
                            type="number"
                            className="form-control"
                            value={memberForm.startYear}
                            onChange={e => setMemberForm(prev => ({ ...prev, startYear: e.target.value }))}
                            required
                          />
                        </div>
                        {memberForm.status === 'former' && (
                          <div className="form-group">
                            <label className="form-label">Service End Year</label>
                            <input
                              type="number"
                              className="form-control"
                              value={memberForm.endYear}
                              onChange={e => setMemberForm(prev => ({ ...prev, endYear: e.target.value }))}
                              required
                            />
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Biography Description</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={memberForm.description}
                          onChange={e => setMemberForm(prev => ({ ...prev, description: e.target.value }))}
                          required
                        ></textarea>
                      </div>

                      {/* Photo Upload */}
                      <div className="form-group">
                        <label className="form-label">Profile Image (Max 1MB)</label>
                        <div className="upload-preview-box">
                          {uploadedImageBase64 ? (
                            <img src={uploadedImageBase64} alt="Preview" className="preview-thumbnail" />
                          ) : (
                            <div className="preview-fallback-txt">No photo uploaded. Will default to avatar.</div>
                          )}
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            className="form-control-file" 
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>

                      <div className="form-btn-group">
                        <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Save'}</button>
                        <button type="button" className="btn btn-outline" onClick={resetFormState}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    /* Members List Table */
                    <div className="crud-table-wrapper">
                      <table className="crud-table">
                        <thead>
                          <tr>
                            <th>Photo</th>
                            <th>Name</th>
                            <th>Designation</th>
                            <th>Status</th>
                            <th>Tenure</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {committee.map(m => (
                            <tr key={m.id}>
                              <td><img src={m.photo} alt={m.name} className="table-row-img circle" /></td>
                              <td><strong>{m.name}</strong></td>
                              <td>{m.role}</td>
                              <td>
                                <span className={`badge ${m.status === 'current' ? 'badge-primary' : 'badge-accent'}`}>
                                  {m.status}
                                </span>
                              </td>
                              <td>{m.startYear}{m.endYear ? ` - ${m.endYear}` : ' - Present'}</td>
                              <td style={{ textAlign: 'right' }}>
                                <div className="table-actions-btns">
                                  <button className="icon-action-btn edit" onClick={() => handleEditMember(m)} title="Edit profile"><Edit size={14} /></button>
                                  <button className="icon-action-btn delete" onClick={() => { if(confirm("Are you sure?")) deleteCommitteeMember(m.id); }} title="Delete member"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FESTIVALS MANAGEMENT */}
              {activeTab === 'festivals' && (
                <div className="admin-crud-panel">
                  <div className="crud-header">
                    <h2>Manage Festivals & Events</h2>
                    {!isAdding && (
                      <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(true)}>
                        <Plus size={16} /> Add Festival
                      </button>
                    )}
                  </div>

                  {isAdding ? (
                    /* Festival Form */
                    <form className="crud-form-card" onSubmit={handleSaveFestival}>
                      <h3>{editingItem ? 'Edit Festival details' : 'Add New Festival'}</h3>
                      <div className="form-group">
                        <label className="form-label">Festival / Event Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={festivalForm.name}
                          onChange={e => setFestivalForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label className="form-label">Year Celebrated</label>
                          <input
                            type="number"
                            className="form-control"
                            value={festivalForm.year}
                            onChange={e => setFestivalForm(prev => ({ ...prev, year: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Celebration Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={festivalForm.date}
                            onChange={e => setFestivalForm(prev => ({ ...prev, date: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label className="form-label">Location Venue</label>
                          <input
                            type="text"
                            className="form-control"
                            value={festivalForm.location}
                            onChange={e => setFestivalForm(prev => ({ ...prev, location: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Event Type Category</label>
                          <select
                            className="form-control"
                            value={festivalForm.type}
                            onChange={e => setFestivalForm(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="religious">Religious/Spiritual</option>
                            <option value="cultural">Cultural/Artistic</option>
                            <option value="social">Social/Welfare</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Summary Description</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={festivalForm.description}
                          onChange={e => setFestivalForm(prev => ({ ...prev, description: e.target.value }))}
                          required
                        ></textarea>
                      </div>

                      {/* Cover Photo Upload */}
                      <div className="form-group">
                        <label className="form-label">Cover Banner (Max 1MB)</label>
                        <div className="upload-preview-box">
                          {uploadedImageBase64 ? (
                            <img src={uploadedImageBase64} alt="Preview" className="preview-thumbnail banner" />
                          ) : (
                            <div className="preview-fallback-txt">No photo uploaded. Will use general background.</div>
                          )}
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            className="form-control-file" 
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>

                      <div className="form-btn-group">
                        <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Save'}</button>
                        <button type="button" className="btn btn-outline" onClick={resetFormState}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    /* Festivals List */
                    <div className="crud-table-wrapper">
                      <table className="crud-table">
                        <thead>
                          <tr>
                            <th>Cover</th>
                            <th>Festival Name</th>
                            <th>Year</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {festivals.map(f => (
                            <tr key={f.id}>
                              <td><img src={f.coverImage} alt={f.name} className="table-row-img rect" /></td>
                              <td><strong>{f.name}</strong></td>
                              <td>{f.year}</td>
                              <td><span className="badge badge-accent">{f.type}</span></td>
                              <td>{f.location}</td>
                              <td style={{ textAlign: 'right' }}>
                                <div className="table-actions-btns">
                                  <button className="icon-action-btn edit" onClick={() => handleEditFestival(f)} title="Edit event"><Edit size={14} /></button>
                                  <button className="icon-action-btn delete" onClick={() => { if(confirm("Warning: Deleting this festival will delete all associated albums and photos! Do you wish to proceed?")) deleteCommunityFestival(f.id); }} title="Delete event"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ALBUMS & PHOTOS UPLOAD */}
              {activeTab === 'gallery' && (
                <div className="admin-crud-panel">
                  
                  {/* Grid layout splitting Album creation vs Photo upload */}
                  <div className="gallery-split-layout">
                    
                    {/* Part A: Albums Creation */}
                    <div className="gallery-layout-block">
                      <h3>Create Photo Album</h3>
                      <form className="crud-form-card" onSubmit={handleSaveAlbum}>
                        <div className="form-group">
                          <label className="form-label">Belongs to Festival</label>
                          <select
                            className="form-control"
                            value={albumForm.festivalId}
                            onChange={e => {
                              const selectedFes = festivals.find(f => f.id === e.target.value);
                              setAlbumForm(prev => ({
                                ...prev,
                                festivalId: e.target.value,
                                year: selectedFes ? selectedFes.year : new Date().getFullYear()
                              }));
                            }}
                            required
                          >
                            <option value="">Select Festival...</option>
                            {festivals.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Album Title</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Traditional Dance Stage"
                            value={albumForm.name}
                            onChange={e => setAlbumForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Short Description</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Album summary..."
                            value={albumForm.description}
                            onChange={e => setAlbumForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>

                        <button type="submit" className="btn btn-primary btn-sm btn-block">
                          Create Album
                        </button>
                      </form>

                      {/* Display existing albums */}
                      <h4 style={{ marginTop: '30px', marginBottom: '14px', fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 600 }}>
                        Existing Albums ({albums.length})
                      </h4>
                      <div className="albums-simple-list">
                        {albums.map(a => {
                          const count = photos.filter(p => p.albumId === a.id).length;
                          return (
                            <div key={a.id} className="album-list-row">
                              <div>
                                <strong>{a.name}</strong>
                                <span>{a.year} • {count} photos</span>
                              </div>
                              <button className="icon-action-btn delete" onClick={() => { if(confirm("Delete this album and all its photos?")) deletePhotoAlbum(a.id); }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Part B: Photos Upload Manager */}
                    <div className="gallery-layout-block">
                      <h3>Upload Photographs</h3>
                      <form className="crud-form-card" onSubmit={handleUploadPhotos}>
                        <div className="form-group">
                          <label className="form-label">Target Album</label>
                          <select
                            className="form-control"
                            value={photoForm.albumId}
                            onChange={e => setPhotoForm(prev => ({ ...prev, albumId: e.target.value }))}
                            required
                          >
                            <option value="">Select Target Album...</option>
                            {albums.map(a => (
                              <option key={a.id} value={a.id}>{a.name} ({a.year})</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Photo File Upload (Max 1MB)</label>
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            className="form-control" 
                            onChange={handleFileChange}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">OR Link Bulk Image URLs (One URL per line)</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                            value={bulkPhotoUrls}
                            onChange={e => setBulkPhotoUrls(e.target.value)}
                          ></textarea>
                        </div>

                        <div className="form-row-2">
                          <div className="form-group">
                            <label className="form-label">Photo Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={photoForm.date}
                              onChange={e => setPhotoForm(prev => ({ ...prev, date: e.target.value }))}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Location</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. Central Hall"
                              value={photoForm.location}
                              onChange={e => setPhotoForm(prev => ({ ...prev, location: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="form-row-2">
                          <div className="form-group">
                            <label className="form-label">Photo Caption</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Description..."
                              value={photoForm.caption}
                              onChange={e => setPhotoForm(prev => ({ ...prev, caption: e.target.value }))}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Photographer Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Name..."
                              value={photoForm.photographer}
                              onChange={e => setPhotoForm(prev => ({ ...prev, photographer: e.target.value }))}
                            />
                          </div>
                        </div>

                        <button type="submit" className="btn btn-accent btn-sm btn-block">
                          Upload Photo(s)
                        </button>
                      </form>

                      {/* Display recent photos */}
                      <h4 style={{ marginTop: '30px', marginBottom: '14px', fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 600 }}>
                        All Photo Files in Gallery ({photos.length})
                      </h4>
                      <div className="photos-simple-grid">
                        {photos.slice(-12).reverse().map(p => (
                          <div key={p.id} className="photo-grid-box">
                            <img src={p.url} alt={p.caption} className="grid-thumbnail" />
                            <div className="photo-actions-overlay">
                              <button className="small-action-btn delete" onClick={() => { if(confirm("Delete photo?")) deleteAlbumPhoto(p.id); }} title="Delete photo">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: INBOX MESSAGES */}
              {activeTab === 'messages' && (
                <div className="admin-crud-panel">
                  <h2>Trust Contact Inbox ({unreadCount} unread)</h2>
                  <p style={{ color: 'var(--text-medium)', marginBottom: '24px' }}>
                    Messages sent by website visitors are listed here. Read, change read status, or delete files.
                  </p>

                  {messages.length === 0 ? (
                    <div className="directory-empty-state">
                      <p>Inboxes are empty. No messages received yet.</p>
                    </div>
                  ) : (
                    <div className="messages-list">
                      {messages.map(msg => (
                        <div 
                          key={msg.id} 
                          className={`message-inbox-row ${msg.readStatus ? 'read' : 'unread'}`}
                          onClick={() => setActiveMessage(msg)}
                        >
                          <div className="message-header-row">
                            <span className="msg-sender">{msg.name}</span>
                            <span className="msg-time">{new Date(msg.timestamp).toLocaleString()}</span>
                          </div>
                          <span className="msg-subject">{msg.subject}</span>
                          <p className="msg-preview">{msg.message.substring(0, 80)}...</p>
                          <div className="msg-row-actions" onClick={e => e.stopPropagation()}>
                            <button className="icon-action-btn" onClick={() => toggleMessageRead(msg.id)}>
                              {msg.readStatus ? <EyeOff size={14} title="Mark unread" /> : <Eye size={14} title="Mark read" />}
                            </button>
                            <button className="icon-action-btn delete" onClick={() => removeMessage(msg.id)}>
                              <Trash2 size={14} title="Delete message" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Detail Message Modal Overlay */}
                  {activeMessage && (
                    <div className="message-modal-overlay" onClick={() => setActiveMessage(null)}>
                      <div className="message-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="message-modal-header">
                          <h3>Inquiry Detail</h3>
                          <button className="toolbar-btn close-btn" onClick={() => setActiveMessage(null)}>
                            <X size={18} />
                          </button>
                        </div>
                        <div className="message-modal-body">
                          <table className="inbox-details-table">
                            <tbody>
                              <tr>
                                <td><strong>Sender:</strong></td>
                                <td>{activeMessage.name}</td>
                              </tr>
                              <tr>
                                <td><strong>Email:</strong></td>
                                <td><a href={`mailto:${activeMessage.email}`}>{activeMessage.email}</a></td>
                              </tr>
                              <tr>
                                <td><strong>Phone:</strong></td>
                                <td>{activeMessage.phone}</td>
                              </tr>
                              <tr>
                                <td><strong>Subject:</strong></td>
                                <td><strong>{activeMessage.subject}</strong></td>
                              </tr>
                              <tr>
                                <td><strong>Sent At:</strong></td>
                                <td>{new Date(activeMessage.timestamp).toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                          <div className="inbox-body-content">
                            <h4>Message:</h4>
                            <p>{activeMessage.message}</p>
                          </div>
                        </div>
                        <div className="message-modal-footer">
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => {
                              toggleMessageRead(activeMessage.id);
                              setActiveMessage(null);
                            }}
                          >
                            {activeMessage.readStatus ? 'Mark Unread' : 'Mark as Read'}
                          </button>
                          <button 
                            className="btn btn-outline btn-sm" 
                            onClick={() => {
                              if (confirm("Delete message?")) {
                                removeMessage(activeMessage.id);
                                setActiveMessage(null);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Styled Admin Panel styles */}
      <style>{`
        .admin-login-barrier {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 0;
        }

        .admin-login-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
          padding: 40px;
          border-radius: var(--radius-lg);
          max-width: 440px;
          width: 100%;
          text-align: center;
        }

        .admin-lock-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-full);
          background-color: var(--primary-fade);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .admin-login-card h2 {
          font-size: 1.6rem;
          margin-bottom: 10px;
        }

        .admin-login-card p {
          color: var(--text-medium);
          font-size: 0.9rem;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .admin-tip-footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
          font-size: 0.8rem;
          color: var(--text-light);
        }

        /* Dashboard layout */
        .admin-dashboard-container {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .admin-top-menu {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
          background-color: #fafaf9;
        }

        .admin-profile-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .admin-icon-circle {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background-color: var(--primary-fade);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-profile-badge h3 {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 2px;
        }

        .admin-profile-badge span {
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .admin-workspace {
          display: flex;
          min-height: 600px;
        }

        .admin-sidebar {
          width: 240px;
          border-right: 1px solid var(--border-color);
          background-color: #fcfcfc;
          padding: 24px 0;
          flex-shrink: 0;
        }

        .sidebar-tabs {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 16px;
        }

        .sidebar-tabs li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-medium);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition-fast);
          position: relative;
        }

        .sidebar-tabs li:hover {
          background-color: var(--bg-main);
          color: var(--primary);
        }

        .sidebar-tabs li.active {
          background-color: var(--primary-fade);
          color: var(--primary);
        }

        .unread-counter-badge {
          position: absolute;
          right: 14px;
          background-color: var(--primary);
          color: #ffffff;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: var(--radius-full);
          font-weight: 700;
        }

        .admin-main-panel {
          flex: 1;
          padding: 30px 40px;
          overflow-y: auto;
          text-align: left;
        }

        /* Overview Tab */
        .admin-overview-tab h2 {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }

        .quick-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .q-stat {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 20px;
          border-radius: var(--radius-md);
          text-align: center;
        }

        .q-stat span {
          font-size: 0.8rem;
          color: var(--text-light);
          font-weight: 600;
          text-transform: uppercase;
        }

        .q-stat h3 {
          font-size: 2rem;
          font-family: var(--font-serif);
          margin-top: 4px;
        }

        .database-utilities-card {
          border: 1px dashed var(--accent-dark);
          background-color: #fffbf0;
          padding: 24px;
          border-radius: var(--radius-md);
        }

        .database-utilities-card h3 {
          font-family: var(--font-sans);
          font-size: 1.15rem;
          margin-bottom: 8px;
          color: var(--accent-dark);
        }

        .utilities-btn-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* CRUD headers & tables */
        .crud-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .crud-form-card {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 24px;
          border-radius: var(--radius-md);
        }

        .crud-form-card h3 {
          font-family: var(--font-sans);
          font-size: 1.2rem;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
        }

        .form-btn-group {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .upload-preview-box {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 10px;
          background: #ffffff;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        }

        .preview-thumbnail {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-full);
          object-fit: cover;
        }

        .preview-thumbnail.banner {
          width: 80px;
          height: 50px;
          border-radius: var(--radius-sm);
        }

        .preview-fallback-txt {
          font-size: 0.8rem;
          color: var(--text-light);
        }

        .crud-table-wrapper {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .crud-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .crud-table th, .crud-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .crud-table th {
          background-color: #fafaf9;
          font-weight: 600;
          color: var(--text-medium);
        }

        .table-row-img {
          object-fit: cover;
          border: 1px solid var(--border-color);
        }

        .table-row-img.circle {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
        }

        .table-row-img.rect {
          width: 44px;
          height: 30px;
          border-radius: var(--radius-sm);
        }

        .table-actions-btns {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .icon-action-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-medium);
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .icon-action-btn:hover {
          background-color: var(--primary-fade);
          color: var(--primary);
        }

        .icon-action-btn.delete:hover {
          background-color: rgba(198, 40, 40, 0.1);
          color: var(--error);
          border-color: rgba(198, 40, 40, 0.2);
        }

        /* Gallery Split Dashboard */
        .gallery-split-layout {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 30px;
        }

        .gallery-layout-block h3 {
          font-size: 1.3rem;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }

        .albums-simple-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .album-list-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          border-bottom: 1px solid var(--border-color);
        }

        .album-list-row:last-child {
          border-bottom: none;
        }

        .album-list-row strong {
          display: block;
          font-size: 0.85rem;
        }

        .album-list-row span {
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .photos-simple-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 10px;
        }

        .photo-grid-box {
          position: relative;
          height: 70px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .grid-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-actions-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .photo-grid-box:hover .photo-actions-overlay {
          opacity: 1;
        }

        .small-action-btn {
          width: 22px;
          height: 22px;
          background: #ffffff;
          border: none;
          color: var(--error);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* Message inbox styling */
        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message-inbox-row {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          cursor: pointer;
          transition: var(--transition-fast);
          position: relative;
        }

        .message-inbox-row:hover {
          border-color: var(--primary-light);
          box-shadow: var(--shadow-sm);
        }

        .message-inbox-row.unread {
          border-left: 4px solid var(--primary);
          background-color: var(--primary-fade);
        }

        .message-header-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-light);
          margin-bottom: 4px;
        }

        .msg-sender {
          font-weight: 700;
          color: var(--text-dark);
        }

        .msg-subject {
          display: block;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--primary-dark);
          margin-bottom: 6px;
        }

        .msg-preview {
          font-size: 0.85rem;
          color: var(--text-medium);
        }

        .msg-row-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 10px;
        }

        /* Message details modal */
        .message-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(10, 8, 8, 0.5);
          z-index: 1001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .message-modal-card {
          background-color: var(--bg-card);
          width: 100%;
          max-width: 500px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .message-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .message-modal-body {
          padding: 20px;
        }

        .inbox-details-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          margin-bottom: 20px;
        }

        .inbox-details-table td {
          padding: 6px 0;
          text-align: left;
        }

        .inbox-details-table td:first-child {
          width: 80px;
          color: var(--text-light);
        }

        .inbox-body-content {
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
        }

        .inbox-body-content h4 {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          margin-bottom: 8px;
          color: var(--text-medium);
        }

        .inbox-body-content p {
          font-size: 0.95rem;
          color: var(--text-dark);
          line-height: 1.5;
          background-color: var(--bg-main);
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .message-modal-footer {
          padding: 14px 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        @media (max-width: 900px) {
          .admin-workspace {
            flex-direction: column;
          }
          .admin-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
            padding: 10px 0;
          }
          .sidebar-tabs {
            flex-direction: row;
            overflow-x: auto;
            padding: 0 16px 8px;
          }
          .sidebar-tabs li {
            white-space: nowrap;
          }
          .admin-main-panel {
            padding: 20px;
          }
          .gallery-split-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
