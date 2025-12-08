import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "InfraDash - IT Infrastructure Dashboard",
  description: "IT Infrastructure Dashboard for Seatrium",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
