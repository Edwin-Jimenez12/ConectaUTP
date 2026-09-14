import { useEffect, useState } from 'react';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { ExplorePage } from './components/ExplorePage';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { Menu } from './components/Menu';

function App() {
  const [currentPage, setCurrentPage] = useState(window.location.hash || '#inicio');

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(window.location.hash || '#inicio');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isExplorePage = currentPage === '#explorar';
  const isAboutPage = currentPage === '#nosotros';
  const isContactPage = currentPage === '#contactanos';

  return (
    <div className="min-h-screen overflow-hidden bg-[#fdfdfd] font-inter text-[#141414]">
      <Menu />
      <main>
        {isExplorePage ? (
          <ExplorePage />
        ) : isAboutPage ? (
          <AboutPage />
        ) : isContactPage ? (
          <ContactPage />
        ) : (
          <HomePage />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
