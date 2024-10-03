import React from "react";
import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import ReactDOM from "react-dom/client";
import $ from "jquery";
import {NextUIProvider} from "@nextui-org/react";

import "./assets/scss/index.scss";
import Navigation from "./assets/components/Navigation.tsx";
import {applyTheme} from "./assets/ts/Theme.ts";
import DatabaseListPage from "./assets/pages/DatabaseListPage.tsx";
import {AuthProvider} from "./assets/providers/AuthProvider.tsx";
import DatabaseOptionsPage from "./assets/pages/DatabaseOptionsPage.tsx";
import DatabaseViewPage from "./assets/pages/DatabaseViewPage.tsx";
import {SearchProvider} from "./assets/providers/SearchProvider.tsx";

export const isProduction = window.location.hostname === "pricing-new.mardens.com";
export const baseUrl = isProduction ? "" : "http://pricing.local";

ReactDOM.createRoot($("#root")[0]!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <SearchProvider>
                    <MainContentRenderer/>
                </SearchProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);

export function MainContentRenderer()
{
    applyTheme();
    const navigate = useNavigate();
    return (
        <NextUIProvider navigate={navigate}>
            <Navigation/>
            <Routes>
                <Route path="/" element={<DatabaseListPage/>}/>
                <Route path="/new" element={<DatabaseOptionsPage/>}/>
                <Route path="/:id" element={<DatabaseViewPage/>}/>
                <Route path="/:id/edit" element={<DatabaseOptionsPage/>}/>
            </Routes>
        </NextUIProvider>
    );
}
