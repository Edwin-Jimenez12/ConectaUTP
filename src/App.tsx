import { useEffect, useRef, useState } from 'react';
import { Footer } from './components/Footer';
import { Menu } from './components/Menu';
import { ProfileSettingsPage } from './components/ProfileSettingsPage';
import { PrivacySettingsPage } from './components/PrivacySettingsPage';
import { SecuritySettingsPage } from './components/SecuritySettingsPage';
import { AccountSettingsPage } from './components/AccountSettingsPage';
import { AuthPage } from './components/AuthPage';
import { useAuth } from './auth/useAuth';
import { Contactanos } from './pages/Contactanos';
import { Explora } from './pages/Explora';
import { Inicio } from './pages/Inicio';
import { Nosotros } from './pages/Nosotros';
import { CrearServicio } from './pages/CrearServicio';
import { GestionServicios } from './pages/GestionServicios';
import { PerfilPublico } from './pages/PerfilPublico';
import { ServicioPublico } from './pages/ServicioPublico';
import { Planes } from './pages/Planes';
import { Chats } from './pages/Chats';
import { Actualizaciones } from './pages/Actualizaciones';
import { AdminPanel } from './pages/AdminPanel';
import { Favoritos } from './pages/Favoritos';
import { Terminos } from './pages/Terminos';
import { PoliticaPrivacidad } from './pages/PoliticaPrivacidad';

function App() {
  const { session, isAdmin, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(window.location.hash || '#inicio');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => window.localStorage.getItem('conecta-theme') === 'dark' ? 'dark' : 'light');
  const hasResolvedInitialSession = useRef(false);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(window.location.hash || '#inicio');
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isExplorePage = currentPage === '#explorar';
  const isAboutPage = currentPage === '#nosotros';
  const isContactPage = currentPage === '#contactanos';
  const isPlansPage = currentPage === '#planes';
  const isUpdatesPage = currentPage === '#actualizaciones';
  const isTermsPage = currentPage === '#terminos';
  const isPrivacyPolicyPage = currentPage === '#politica-privacidad';
  const isAdminPage = currentPage === '#admin';
  const isSettingsPage = currentPage === '#configuracion';
  const isPrivacyPage = currentPage === '#privacidad';
  const isSecurityPage = currentPage === '#seguridad';
  const isAccountPage = currentPage === '#mi-cuenta';
  const isLoginPage = currentPage === '#login';
  const isRegisterPage = currentPage === '#registro';
  const isCreateServicePage = currentPage === '#publicar';
  const isManageServicesPage = currentPage === '#mis-servicios';
  const isFavoritesPage = currentPage === '#favoritos';
  const isChatsPage = currentPage === '#chats' || currentPage.startsWith('#chats/');
  const chatServiceId = currentPage.startsWith('#chats/') ? currentPage.slice('#chats/'.length) : '';
  const serviceId = currentPage.startsWith('#servicio/') ? currentPage.slice('#servicio/'.length) : '';
  const profileId = currentPage.startsWith('#perfil/') ? currentPage.slice('#perfil/'.length) : '';
  const isProtectedPage = isSettingsPage || isPrivacyPage || isSecurityPage || isAccountPage || isCreateServicePage || isManageServicesPage || isFavoritesPage || isChatsPage || isAdminPage;
  useEffect(() => {
    if (!isLoading && isProtectedPage && !session) {
      window.location.hash = '#login';
    }
  }, [isLoading, isProtectedPage, session]);

  useEffect(() => {
    if (!isLoading && session && isAboutPage) {
      window.location.hash = '#inicio';
    }
  }, [isAboutPage, isLoading, session]);

  useEffect(() => {
    if (!isLoading && isAdminPage && session && !isAdmin) {
      window.location.hash = '#inicio';
    }
  }, [isAdmin, isAdminPage, isLoading, session]);

  useEffect(() => {
    if (isLoading || hasResolvedInitialSession.current) return;

    hasResolvedInitialSession.current = true;
    if (session && isAdmin && (currentPage === '#inicio' || currentPage === '#login')) {
      window.location.hash = '#admin';
    }
  }, [currentPage, isAdmin, isLoading, session]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    window.localStorage.setItem('conecta-theme', theme);
  }, [theme]);


  return (
    <div data-theme={theme} className="min-h-screen overflow-hidden bg-[#fdfdfd] font-inter text-[#141414]">
      <Menu theme={theme} onToggleTheme={() => setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light')} />
      <main className="pt-[76px]">
        {isLoginPage ? (
          <AuthPage mode="login" theme={theme} />
        ) : isRegisterPage ? (
          <AuthPage mode="register" theme={theme} />
        ) : isLoading ? (
          <div className="flex min-h-[560px] items-center justify-center text-sm text-[#676878]">Cargando sesión...</div>
        ) : isProtectedPage && !session ? (
          <AuthPage mode="login" theme={theme} />
        ) : isAdminPage ? (
          isAdmin ? <AdminPanel /> : <Inicio />
        ) : serviceId ? (
          <ServicioPublico serviceId={serviceId} />
        ) : profileId ? (
          <PerfilPublico profileId={profileId} />
        ) : isCreateServicePage ? (
          <CrearServicio />
        ) : isManageServicesPage ? (
          <GestionServicios />
        ) : isFavoritesPage ? (
          <Favoritos />
        ) : isChatsPage ? (
          <Chats initialServiceId={chatServiceId} />
        ) : isExplorePage ? (
          <Explora />
        ) : isAboutPage ? (
          <Nosotros />
        ) : isContactPage ? (
          <Contactanos />
        ) : isPlansPage ? (
          <Planes />
        ) : isUpdatesPage ? (
          <Actualizaciones />
        ) : isTermsPage ? (
          <Terminos />
        ) : isPrivacyPolicyPage ? (
          <PoliticaPrivacidad />
        ) : isSettingsPage ? (
          <ProfileSettingsPage />
        ) : isPrivacyPage ? (
          <PrivacySettingsPage />
        ) : isSecurityPage ? (
          <SecuritySettingsPage />
        ) : isAccountPage ? (
          <AccountSettingsPage />
        ) : (
          <Inicio />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
