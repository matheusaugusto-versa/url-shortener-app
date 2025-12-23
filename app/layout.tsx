import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/toast-provider";
import { I18nProvider } from "@/components/i18n-provider";


export const metadata: Metadata = {
  title: "URL Shortener",
  description: "Encurte suas URLs facilmente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme');
                  let theme = 'light';
                  
                  if (storedTheme) {
                    theme = storedTheme;
                  } else {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = prefersDark ? 'dark' : 'light';
                  }
                  
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {
                  console.error('Erro ao aplicar tema:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
          <ErrorBoundary>
            <I18nProvider>
              <AuthProvider>
                <ToastProvider />
                {children}
              </AuthProvider>
            </I18nProvider>
          </ErrorBoundary>
      </body>
    </html>
  );
}
