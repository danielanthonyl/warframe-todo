import { createBrowserRouter } from "react-router-dom";
import { SelectScreen } from "../screens/SelectScreen.tsx/SelectScreen";
import { ItemListScreen } from "../screens/ItemListScreen/ItemListScreen";
import { ItemScreen } from "../screens/ItemScreen/ItemScreen";
import { Layout } from "../components/Layout/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    // loader: rootLoader,
    children: [
      {
        path: "/select",
        index: true,
        element: <SelectScreen />,
        // loader: teamLoader,
      },
      {
        path: "/item-list",
        element: <ItemListScreen />,
        // loader: teamLoader,
      },
      {
        path: "/item/:id",
        element: <ItemScreen />,
        // loader: teamLoader,
      },
    ],
  },
]);
