import { Routes, Route } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import AdminLayout from '@components/admin/AdminLayout';
import HomePage from '@pages/HomePage';
import BlogPage from '@pages/BlogPage';
import ArticlePage from '@pages/ArticlePage';
import LoginPage from '@pages/admin/LoginPage';
import DashboardPage from '@pages/admin/DashboardPage';
import ExperiencesPage from '@pages/admin/ExperiencesPage';
import ProjectsPage from '@pages/admin/ProjectsPage';
import ArticlesPage from '@pages/admin/ArticlesPage';
import ArticleEditorPage from '@pages/admin/ArticleEditorPage';
import SkillsPage from '@pages/admin/SkillsPage';
import SettingsPage from '@pages/admin/SettingsPage';
import ProtectedRoute from '@components/admin/ProtectedRoute';

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="projects" element={<HomePage section="projects" />} />
                <Route path="articles" element={<BlogPage />} />
                <Route path="articles/:slug" element={<ArticlePage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<DashboardPage />} />
                <Route path="experiences" element={<ExperiencesPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="articles" element={<ArticlesPage />} />
                <Route path="articles/new" element={<ArticleEditorPage />} />
                <Route path="articles/:id/edit" element={<ArticleEditorPage />} />
                <Route path="skills" element={<SkillsPage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>
        </Routes>
    );
}