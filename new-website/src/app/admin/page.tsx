import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminPanel from "@/components/admin/AdminPanel";

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return <AdminPanel />;
}
