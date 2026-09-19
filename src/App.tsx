import { useEffect, useState } from 'react';
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

function App() {
  const { session, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(window.location.hash || '#inicio');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => window.localStorage.getItem('conecta-theme') === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(window.location.hash || '#inicio');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isExplorePage = currentPage === '#explorar';
  const isAboutPage = currentPage === '#nosotros';
  const isContactPage = currentPage === '#contactanos';
  const isPlansPage = currentPage === '#planes';
  const isSettingsPage = currentPage === '#configuracion';
  const isPrivacyPage = currentPage === '#privacidad';
  const isSecurityPage = currentPage === '#seguridad';
  const isAccountPage = currentPage === '#mi-cuenta';
  const isLoginPage = currentPage === '#login';
  const isRegisterPage = currentPage === '#registro';
  const isCreateServicePage = currentPage === '#publicar';
  const isManageServicesPage = currentPage === '#mis-servicios';
  const isChatsPage = currentPage === '#chats' || currentPage.startsWith('#chats/');
  const chatServiceId = currentPage.startsWith('#chats/') ? currentPage.slice('#chats/'.length) : '';
  const serviceId = currentPage.startsWith('#servicio/') ? currentPage.slice('#servicio/'.length) : '';
  const profileId = currentPage.startsWith('#perfil/') ? currentPage.slice('#perfil/'.length) : '';
  const isProtectedPage = isSettingsPage || isPrivacyPage || isSecurityPage || isAccountPage || isCreateServicePage || isManageServicesPage || isChatsPage;

  useEffect(() => {
    if (!isLoading && isProtectedPage && !session) {
      window.location.hash = '#login';
    }
  }, [isLoading, isProtectedPage, session]);

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
        ) : serviceId ? (
          <ServicioPublico serviceId={serviceId} />
        ) : profileId ? (
          <PerfilPublico profileId={profileId} />
        ) : isCreateServicePage ? (
          <CrearServicio />
        ) : isManageServicesPage ? (
          <GestionServicios />
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
