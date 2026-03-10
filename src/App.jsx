import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CountdownProvider } from './contexts/CountdownContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RealtimeProvider from './components/common/RealtimeProvider';
import { ChatProvider } from './contexts/ChatContext';
import ChatWidget from './components/Chat/ChatWidget';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import SessionExpiryHandler from './components/common/SessionExpiryHandler';
import { AppRoutes } from './routes';

const AppContent = () => {
  const { user } = useAuth();

  return (
    <CountdownProvider>
      <RealtimeProvider>
        <ChatProvider currentUser={user}>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SessionExpiryHandler />
            <AppRoutes />
            {user && <ChatWidget />}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </Router>
        </ChatProvider>
      </RealtimeProvider>
    </CountdownProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
