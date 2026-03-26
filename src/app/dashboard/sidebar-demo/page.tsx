import DemoOne from "@/components/ui/demo";

export default function SidebarDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <DemoOne />
      <main className="ml-0 p-6 sm:ml-80">
        <h1 className="text-2xl font-semibold text-foreground">Sidebar Demo</h1>
        <p className="mt-2 text-muted-foreground">
          This page is used to preview the sidebar-with-submenu component in this project.
        </p>
      </main>
    </div>
  );
}
