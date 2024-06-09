import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Stories from "./pages/Stories/Stories";

import "./index.scss";
import ThemeContextProvider from "./context/theam-context.tsx";
import App from "./App.tsx";
import Login from "./pages/Login/Login.tsx";
import FontContextProvider from "./context/Font-context.tsx";
import MyStory from "./pages/MyStory/MyStory.tsx";
import UserContextProvider from "./context/User-context.tsx";
import Protected from "./pages/Protected/Protected.tsx";
import TotalPosts from "./pages/TotalPosts/TotalPosts.tsx";

const router = createBrowserRouter([
  {
    path: "/storycorner/",
    element: <App />,
    children: [
      {
        path: "/storycorner/login",
        element: <Login />,
      },
      {
        path: "/storycorner/",
        element: (
          <Protected>
            <Stories />
          </Protected>
        ),
      },
      {
        path: "/storycorner/myPosts",
        element: (
          <Protected>
            <TotalPosts />
          </Protected>
        ),
      },
      {
        path: "/storycorner/story",
        element: (
          <Protected>
            <MyStory />
          </Protected>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserContextProvider>
      <ThemeContextProvider>
        <FontContextProvider>
          <RouterProvider router={router} />
        </FontContextProvider>
      </ThemeContextProvider>
    </UserContextProvider>
  </React.StrictMode>
);
