import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
      <div className="flex overflow-hidden h-screen w-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-64 h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-margin-desktop relative">
            {children}
          </main>
        </div>
      </div>
  );
}
