import { LightRays } from "@/components/ui/light-rays"
import { TextRoll } from "@/components/ui/text-roll"

export default function AboutBanner() {
    return (
        <section id="about-banner" className="overflow-hidden text-neutral-900 dark:text-neutral-100">
            <div className="flex w-full h-full justify-center items-center overflow-hidden">
                <div className="h-40 sm:h-100 relative w-full overflow-hidden border-y flex-col flex justify-center items-center">
                    <LightRays />
                    <h1 className="text-4xl font-semibold tracking-tight leading-none sm:text-7xl uppercase">about us</h1>
                    <TextRoll className="px-8 mt-3 text-xl sm:text-2xl text-muted-foreground text-center">Behind The Build</TextRoll>
                </div>
            </div>
        </section>
    )
}
