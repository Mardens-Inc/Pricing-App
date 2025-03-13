import React from "react";
import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import ReactDOM from "react-dom/client";
import $ from "jquery";

import "./assets/scss/index.scss";
import Navigation from "./assets/components/Navigation.tsx";
import {applyTheme} from "./assets/ts/Theme.ts";
import DatabaseListPage from "./assets/pages/DatabaseListPage.tsx";
import {AuthProvider} from "./assets/providers/AuthProvider.tsx";
import DatabaseOptionsPage from "./assets/pages/DatabaseOptionsPage.tsx";
import DatabaseViewPage from "./assets/pages/DatabaseViewPage.tsx";
import {SearchProvider} from "./assets/providers/SearchProvider.tsx";
import {DatabaseViewProvider} from "./assets/providers/DatabaseViewProvider.tsx";
import {HeroUIProvider, ToastProvider} from "@heroui/react";
import {NewRecordModalProvider} from "./assets/providers/NewRecordModalProvider.tsx";

export const isProduction = window.location.hostname === "pricing-new.mardens.com";

export const setTitle = (title?: string) => document.title = `${title ? `${title} - ` : ""}New Pricing Database`;

ReactDOM.createRoot($("#root")[0]!).render(
    <React.StrictMode>
        <BrowserRouter>
                <AuthProvider>
                    <SearchProvider>
                        <DatabaseViewProvider>
                            <NewRecordModalProvider>
                                <MainContentRenderer/>
                            </NewRecordModalProvider>
                        </DatabaseViewProvider>
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
        <HeroUIProvider navigate={navigate}>
            <ToastProvider />
            <Navigation/>
            <Routes>
                <Route path="/" element={<DatabaseListPage/>}/>
                <Route path="/new" element={<DatabaseOptionsPage/>}/>
                <Route path="/inv/:id" element={<DatabaseViewPage/>}/>
                <Route path="/inv/:id/edit" element={<DatabaseOptionsPage/>}/>
                <Route path="*" element={<>Error 404: Page not found.</>}/>
            </Routes>
        </HeroUIProvider>
    );
}
