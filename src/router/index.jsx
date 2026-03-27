import React, { memo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import AppLayout from "../layout";
import {
  authRouters,
  protectedRouters,
  protectedRouters2,
} from "./router.config";
import MainHeader from "../layout/header/MainHeader";

const AppRouter = () => {
  return (
    <Routes>
      {authRouters.map(({ path, component }) => (
        <Route
          key={path}
          path={path}
          element={
            <React.Fragment>
              <MainHeader />
              {React.createElement(component)}
            </React.Fragment>
          }
        />
      ))}
      {[...protectedRouters, ...protectedRouters2].map(
        ({ path, component }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute>
                <AppLayout>{React.createElement(component)}</AppLayout>
              </ProtectedRoute>
            }
          />
        ),
      )}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default memo(AppRouter);
