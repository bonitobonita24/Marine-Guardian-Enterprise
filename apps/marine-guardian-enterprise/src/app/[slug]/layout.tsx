import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Sidebar } from "@/components/shell/sidebar"
import { TRPCProvider } from "@/components/providers/trpc-provider"

interface SlugLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function SlugLayout({ children, params }: SlugLayoutProps) {
  const session = await auth()
  const { slug } = await params

  if (session == null) redirect("/login")

  // Verify the user has a membership for this tenant slug
  if (session.user.activeTenantSlug !== slug) {
    // If user has a known active tenant, redirect there; else go to login
    const knownSlug = session.user.activeTenantSlug
    if (knownSlug != null) {
      redirect(`/${knownSlug}`)
    } else {
      redirect("/login")
    }
  }

  return (
    <TRPCProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar slug={slug} session={session} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </TRPCProvider>
  )
}
