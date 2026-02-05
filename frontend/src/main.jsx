import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, ThemeProvider, LanguageProvider } from '@context';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <LanguageProvider>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </LanguageProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>
);