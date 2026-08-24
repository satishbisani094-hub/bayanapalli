import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import Home from './pages/Home';
import About from './pages/About';
import Committee from './pages/Committee';
import Festivals from './pages/Festivals';
import Gallery from './pages/Gallery';
import AdminDashboard from './pages/AdminDashboard';
import { DatabaseProvider } from './context/DatabaseContext';

function AppContent() {
  const [activePage, setActivePage] = useState('home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [galleryFilter, setGalleryFilter] = useState(null);

  // Sync hash routing on load & back button clicks
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validPages = ['home', 'about', 'committee', 'festivals', 'gallery', 'admin'];
      if (hash && validPages.includes(hash)) {
        setActivePage(hash);
      } else {
        setActivePage('home');
        window.location.hash = 'home';
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activePage]);

  // Page Routing Logic
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <Home 
            setActivePage={setActivePage} 
            setGalleryFilter={setGalleryFilter}
          />
        );
      case 'about':
        return <About />;
      case 'committee':
        return (
          <Committee 
            selectedItem={selectedItem} 
            setSelectedItem={setSelectedItem} 
          />
        );
      case 'festivals':
        return (
          <Festivals 
            setActivePage={setActivePage}
            setGalleryFilter={setGalleryFilter}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
        );
      case 'gallery':
        return (
          <Gallery 
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            galleryFilter={galleryFilter}
            setGalleryFilter={setGalleryFilter}
          />
        );
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Home setActivePage={setActivePage} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation header */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onSearchClick={() => setSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>

      {/* Footer footer */}
      <Footer setActivePage={setActivePage} />

      {/* Global Search Modal Overlay */}
      {searchOpen && (
        <SearchModal 
          onClose={() => setSearchOpen(false)}
          setActivePage={setActivePage}
          setSelectedItem={setSelectedItem}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
}
