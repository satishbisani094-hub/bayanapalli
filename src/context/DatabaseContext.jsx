import React, { createContext, useContext, useState, useEffect } from 'react';
import * as db from '../db/store';

const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const [committee, setCommittee] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with database store
  const refreshState = (dataOverride) => {
    const data = dataOverride || db.getDatabase();
    setCommittee(data.committee || []);
    setFestivals(data.festivals || []);
    setAlbums(data.albums || []);
    setPhotos(data.photos || []);
    setMilestones(data.milestones || []);
    setMessages(data.messages || []);
  };

  useEffect(() => {
    // Async Initial load from Express API
    const init = async () => {
      const data = await db.fetchDatabaseApi();
      refreshState(data);
      setLoading(false);
    };
    init();
  }, []);

  // --- Wrapper Actions ---

  // Committee
  const addCommitteeMember = async (member) => {
    const newMember = await db.addMember(member);
    refreshState();
    return newMember;
  };

  const updateCommitteeMember = async (id, fields) => {
    await db.updateMember(id, fields);
    refreshState();
  };

  const deleteCommitteeMember = async (id) => {
    await db.deleteMember(id);
    refreshState();
  };

  // Festivals
  const addCommunityFestival = async (festival) => {
    const newFes = await db.addFestival(festival);
    refreshState();
    return newFes;
  };

  const updateCommunityFestival = async (id, fields) => {
    await db.updateFestival(id, fields);
    refreshState();
  };

  const deleteCommunityFestival = async (id) => {
    await db.deleteFestival(id);
    refreshState();
  };

  // Albums
  const addPhotoAlbum = async (album) => {
    const newAlb = await db.addAlbum(album);
    refreshState();
    return newAlb;
  };

  const updatePhotoAlbum = async (id, fields) => {
    await db.updateAlbum(id, fields);
    refreshState();
  };

  const deletePhotoAlbum = async (id) => {
    await db.deleteAlbum(id);
    refreshState();
  };

  // Photos
  const addPhotosToAlbum = async (newPhotos) => {
    const added = await db.addPhotos(newPhotos);
    refreshState();
    return added;
  };

  const updateAlbumPhoto = async (id, fields) => {
    await db.updatePhoto(id, fields);
    refreshState();
  };

  const deleteAlbumPhoto = async (id) => {
    await db.deletePhoto(id);
    refreshState();
  };

  const likeAlbumPhoto = async (id) => {
    const updated = await db.likePhoto(id);
    refreshState();
    return updated;
  };

  // Messages
  const sendContactMessage = async (msg) => {
    const newMsg = await db.addMessage(msg);
    refreshState();
    return newMsg;
  };

  const toggleMessageRead = async (id) => {
    await db.toggleMessageReadStatus(id);
    refreshState();
  };

  const removeMessage = async (id) => {
    await db.deleteMessage(id);
    refreshState();
  };

  // Backup & Restore
  const backupDB = () => {
    db.exportDatabase();
  };

  const restoreDB = async (jsonString) => {
    const success = await db.importDatabase(jsonString);
    if (success) {
      refreshState();
    }
    return success;
  };

  const value = {
    committee,
    festivals,
    albums,
    photos,
    milestones,
    messages,
    loading,
    addCommitteeMember,
    updateCommitteeMember,
    deleteCommitteeMember,
    addCommunityFestival,
    updateCommunityFestival,
    deleteCommunityFestival,
    addPhotoAlbum,
    updatePhotoAlbum,
    deletePhotoAlbum,
    addPhotosToAlbum,
    updateAlbumPhoto,
    deleteAlbumPhoto,
    likeAlbumPhoto,
    sendContactMessage,
    toggleMessageRead,
    removeMessage,
    backupDB,
    restoreDB,
    globalSearch: db.globalSearch
  };

  return (
    <DatabaseContext.Provider value={value}>
      {!loading && children}
    </DatabaseContext.Provider>
  );
};
