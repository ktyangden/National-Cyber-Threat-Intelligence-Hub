import Feature from "@/components/Feature";

export default function Features() {
    return (
      <section id="features" className="py-8 px-4 lg:py-16 lg:px-8">
        <div className="md:px-8 px-6 md:py-12 py-8 w-full flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-bold leading-none sm:text-5xl text-foreground">Powerful Threat Intelligence, Simplified</h1>
            <p className="text-xl sm:text-2xl max-w-160 text-muted-foreground">Everything you need to monitor attacks, analyze patterns, and stay ahead of emerging risks</p>
        </div>
            <div className="container mx-auto space-y-8 lg:space-y-12 max-w-6xl">
                <Feature imgSrc="https://res.cloudinary.com/dykzzd9sy/image/upload/v1761674556/luc2_aa5nxe.png"
                    title="Real-Time Threat Monitoring"
                    description="Live dashboards update with honeypot and external attack data in seconds"
                    linkHref="/honeypage" linkText="Open Dashboard" reverse={false}
                />
                <Feature imgSrc="https://res.cloudinary.com/dykzzd9sy/image/upload/v1761674556/luc3_bckrng.png"
                    title="Unified Intelligence Feeds"
                    description="External APIs and honeypot logs blend into one clear, searchable dashboard"
                    linkHref="/threat-feeds" linkText="View Threat Feed" reverse={true}
                />
                <Feature imgSrc="https://res.cloudinary.com/dykzzd9sy/image/upload/v1761674555/luc4_pfwyoh.png"
                    title="Smart AI-Driven Insights"
                    description="Machine learning highlights anomalies, threat patterns, and quick summaries"
                    linkHref="/honeypage" linkText="Explore AI Insights" reverse={false}
                />
            </div>
      </section>
    )
  }
  