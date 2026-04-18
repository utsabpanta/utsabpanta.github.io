import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';

interface HelmetContext {
  helmet?: HelmetServerState;
}

export function render(url: string): { html: string; helmet: HelmetServerState } {
  const helmetContext: HelmetContext = {};

  const html = renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>
  );

  return { html, helmet: helmetContext.helmet! };
}
