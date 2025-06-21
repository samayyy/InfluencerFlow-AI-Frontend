import "./globals.css";
import { Inter, Poppins } from "next/font/google";
import { AuthProvider } from "../context/authContext";
import DashboardWrapper from "../components/layout/DashboardWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "InfluencerFlow AI - Revolutionize Your Influencer Marketing",
  description:
    "The all-in-one AI-powered platform for discovering, connecting, and managing influencer partnerships. Automate your creator campaigns with smart recommendations and seamless workflow management.",
  keywords:
    "influencer marketing, AI, creator discovery, brand partnerships, campaign management",
  openGraph: {
    title: "InfluencerFlow AI - Revolutionize Your Influencer Marketing",
    description:
      "The all-in-one AI-powered platform for discovering, connecting, and managing influencer partnerships.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "InfluencerFlow AI - Revolutionize Your Influencer Marketing",
    description:
      "The all-in-one AI-powered platform for discovering, connecting, and managing influencer partnerships.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <DashboardWrapper>{children}</DashboardWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
