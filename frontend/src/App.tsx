// App.tsx - React 애플리케이션의 기본 라우팅 및 레이아웃 구성
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { FormListPage } from "./pages/FormListPage";
import { FormBuilderPage } from "./pages/FormBuilderPage";
import { FormResponsesPage } from "./pages/FormResponsesPage";
import { FormAnswerPage } from "./pages/FormAnswerPage";

export const App = () => {
    return (
        <AppLayout>
            <Routes>
                <Route path="/" element={<Navigate to="/forms" replace />} />
                <Route path="/forms" element={<FormListPage />} />
                <Route path="/forms/new" element={<FormBuilderPage />} />
                <Route path="/forms/:id/edit" element={<FormBuilderPage />} />
                <Route
                    path="/forms/:id/responses"
                    element={<FormResponsesPage />}
                />
                <Route path="/forms/:id/answer" element={<FormAnswerPage />} />
            </Routes>
        </AppLayout>
    );
};
