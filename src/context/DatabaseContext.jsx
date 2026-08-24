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

  // Sync state with Express database API
  const refreshState = (dataOverride) => {
    const data = dataOverride || db.getDatabase();
    setCommittee(data.committee || []);
    setFestivals(data.festivals || []);
    setAlbums(data.albums || []);
    setPhotos(data.photos || []);
    setMilestones(data.milestones || []);
    setMessages(data.messages || []);
  };

  const syncFromApi = async () => {
    const freshData = await db.fetchDatabaseApi();
    refreshState(freshData);
    return freshData;
  };

  useEffect(() => {
    // Initial load from Express API
    const init = async () => {
      await syncFromApi();
      setLoading(false);
    };
    init();

    // Subscribe to cross-tab DB changes
    const unsubscribe = db.subscribeDbChanged(() => {
      syncFromApi();
    });

    // Periodic polling to catch external changes
    const interval = setInterval(() => {
      syncFromApi();
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // --- Wrapper Actions ---

  // Committee
  const addCommitteeMember = async (member) => {
    const newMember = await db.addMember(member);
    await syncFromApi();
    return newMember;
  };

  const updateCommitteeMember = async (id, fields) => {
    await db.updateMember(id, fields);
    await syncFromApi();
  };

  const deleteCommitteeMember = async (id) => {
    await db.deleteMember(id);
    await syncFromApi();
  };

  // Festivals
  const addCommunityFestival = async (festival) => {
    const newFes = await db.addFestival(festival);
    await syncFromApi();
    return newFes;
  };

  const updateCommunityFestival = async (id, fields) => {
    await db.updateFestival(id, fields);
    await syncFromApi();
  };

  const deleteCommunityFestival = async (id) => {
    await db.deleteFestival(id);
    await syncFromApi();
  };

  // Albums
  const addPhotoAlbum = async (album) => {
    const newAlb = await db.addAlbum(album);
    await syncFromApi();
    return newAlb;
  };

  const updatePhotoAlbum = async (id, fields) => {
    await db.updateAlbum(id, fields);
    await syncFromApi();
  };

  const deletePhotoAlbum = async (id) => {
    await db.deleteAlbum(id);
    await syncFromApi();
  };

  // Photos
  const addPhotosToAlbum = async (newPhotos) => {
    const added = await db.addPhotos(newPhotos);
    await syncFromApi();
    return added;
  };

  const updateAlbumPhoto = async (id, fields) => {
    await db.updatePhoto(id, fields);
    await syncFromApi();
  };

  const deleteAlbumPhoto = async (id) => {
    await db.deletePhoto(id);
    await syncFromApi();
  };

  const likeAlbumPhoto = async (id) => {
    const updated = await db.likePhoto(id);
    await syncFromApi();
    return updated;
  };

  // Messages
  const sendContactMessage = async (msg) => {
    const newMsg = await db.addMessage(msg);
    await syncFromApi();
    return newMsg;
  };

  const toggleMessageRead = async (id) => {
    await db.toggleMessageReadStatus(id);
    await syncFromApi();
  };

  const removeMessage = async (id) => {
    await db.deleteMessage(id);
    await syncFromApi();
  };

  // Backup & Restore
  const backupDB = () => {
    db.exportDatabase();
  };

  const restoreDB = async (jsonString) => {
    const success = await db.importDatabase(jsonString);
    if (success) {
      await syncFromApi();
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
