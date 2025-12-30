import React from 'react';
import Header from './Header';
import Footer from './Footer';
import VerificationBanner from '../VerificationBanner';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { user, isAuthenticated, isVerified } = useAuth();

  // Show banner if user is authenticated but not verified (non-closable)
  const shouldShowBanner = isAuthenticated() && !isVerified();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      {shouldShowBanner && (
        <VerificationBanner user={user} />
      )}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
