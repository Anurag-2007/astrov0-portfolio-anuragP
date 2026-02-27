import dynamic from "next/dynamic"

const SpacePortfolio = dynamic(() => import("@/components/space/space-portfolio"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Initializing Mission Control...
        </span>
      </div>
    </div>
  ),
})

export default function Page() {
  return <SpacePortfolio />
}
