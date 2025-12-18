"use client"

import store from "@/reduxs/store.redux";
import React from "react";
import { Provider } from "react-redux";

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}
export default AppLayout;