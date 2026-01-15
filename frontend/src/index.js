import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import './index.css';
import App from './App';
import NavBar from './components/navBar';
import PageLibrary from './pages/pageLibrary';
import PageChat from './pages/pageChat';
import Acts from './components/acts';
import PageAuth from './pages/pageAuth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import RequireAuth from './components/RequireAuth';
// import reportWebVitals from './reportWebVitals';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <PageAuth />;

  return (
    <>
      <NavBar />
      <main className="landing-content">
        <Outlet />
      </main>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <RequireAuth><App /></RequireAuth>,
      },
      {
        path: "/chat",
        element: <RequireAuth><PageChat /></RequireAuth>,
      },
      {
        path: "/library",
        element: <RequireAuth><PageLibrary /></RequireAuth>,
      },
      {
        path: "/act/:actId",
        element: <RequireAuth><Acts /></RequireAuth>,
      }
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();