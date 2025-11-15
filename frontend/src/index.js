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
import Acts from './components/acts';
// import reportWebVitals from './reportWebVitals';

const Layout = () => {
  return (
    <>
      <NavBar />
      <main className="menu-content">
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
        element: <App />,
      },
      {
        path: "/library",
        element: <PageLibrary />,
      },
      {
        path: "/act/:actId",
        element: <Acts />,
      }
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();