import './globals.css';

export const metadata = {
  title: 'Vizualni-Admin Dashboard',
  description: 'Serbian Data Visualization Admin Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}