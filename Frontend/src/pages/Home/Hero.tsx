import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import Aurora from "@/components/ui/aurora";
import { useNavigate } from "react-router-dom";

export default function Hero() {
const navigate = useNavigate();
  return (
    <section id="hero" className="relative overflow-hidden text-neutral-900 dark:text-neutral-100">
        <div className="pointer-events-none absolute inset-0 z-0">
            <Aurora colorStops={["#d6e6ff", "#fbe0e0", "#f2eaf7"]} blend={1} amplitude={1} speed={0.7} />
        </div>
        <div className="relative z-10 container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-3xl bg-transparent dark:bg-transparent">
            <h1 className="text-4xl font-bold leading-none sm:text-5xl">Real-Time Insight into Global Cyber Threats
            </h1>
            <p className="px-8 mt-8 mb-12 text-xl">Stream. Analyze. Visualize.<br /> Transforming cyber chaos into clarity.</p>
            <a onClick={() => {navigate("/honeypage")}} className="flex flex-wrap justify-center">
                <InteractiveHoverButton>Explore Dashboard</InteractiveHoverButton>
            </a>
            <div className="flex mt-[15%] w-full max-w-6xl xl:w-4xl mask-image fade-mask">
                <img
                    src="/honeypage-light.png" alt="honeypage"
                    className="block dark:hidden rounded-t-4xl border-4 border-neutral-400/20 w-full h-auto object-contain"
                />
                <img
                    src="/honeypage.png" alt="honeypage dark"
                    className="hidden dark:block rounded-t-4xl border-4 border-neutral-600/20 w-full h-auto object-contain"
                />
            </div>
        </div>
    </section>
  )
}
