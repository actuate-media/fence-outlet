import '@prenta/sections-react/styles.css';
import './globals.css';

export const metadata = {
  title: 'Fence Outlet',
  description: 'Fence Outlet website',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
