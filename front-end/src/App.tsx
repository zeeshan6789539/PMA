import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to My App</h1>
          <p className="text-muted-foreground">
            This is a Vite + React + TypeScript project with Tailwind CSS and shadcn/ui.
          </p>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
