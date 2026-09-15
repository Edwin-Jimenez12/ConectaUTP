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

function App() {
  const { session, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(window.location.hash || '#inicio');

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
  const serviceId = currentPage.startsWith('#servicio/') ? currentPage.slice('#servicio/'.length) : '';
  const profileId = currentPage.startsWith('#perfil/') ? currentPage.slice('#perfil/'.length) : '';
  const isProtectedPage = isSettingsPage || isPrivacyPage || isSecurityPage || isAccountPage || isCreateServicePage || isManageServicesPage;

  useEffect(() => {
    if (!isLoading && isProtectedPage && !session) {
      window.location.hash = '#login';
    }
  }, [isLoading, isProtectedPage, session]);


  return (
    <div className="min-h-screen overflow-hidden bg-[#fdfdfd] font-inter text-[#141414]">
      <Menu />
      <main className="pt-[76px]">
        {isLoginPage ? (
          <AuthPage mode="login" />
        ) : isRegisterPage ? (
          <AuthPage mode="register" />
        ) : isLoading ? (
          <div className="flex min-h-[560px] items-center justify-center text-sm text-[#676878]">Cargando sesión...</div>
        ) : isProtectedPage && !session ? (
          <AuthPage mode="login" />
        ) : serviceId ? (
          <ServicioPublico serviceId={serviceId} />
        ) : profileId ? (
          <PerfilPublico profileId={profileId} />
        ) : isCreateServicePage ? (
          <CrearServicio />
        ) : isManageServicesPage ? (
          <GestionServicios />
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
