// src/routes.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// 用@别名导入，路径更简洁且不易错
import Cover from "@/pages/Cover.tsx";
import Navigation from "@/pages/Navigation.tsx";
import Turntable from "@/pages/Turntable.tsx";
import Ballroom from "@/pages/Ballroom.tsx";
import Collection from "@/pages/Collection.tsx";

const router = createBrowserRouter([
  { path: "/", element: <Cover /> },
  { path: "/navigation", element: <Navigation /> },
  { path: "/turntable", element: <Turntable /> },
  { path: "/ballroom", element: <Ballroom /> },
  { path: "/collection", element: <Collection /> },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;