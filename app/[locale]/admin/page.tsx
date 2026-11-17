import AdminDashboard from "./AdminDashboard";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

/** The business dashboard — Google sign-in, admins only (lib/admin.ts). */
export default function AdminPage() {
  return <AdminDashboard posthogUrl={process.env.NEXT_PUBLIC_POSTHOG_DASHBOARD_URL ?? "https://us.posthog.com/project/744023"} />;
}
