import { Story } from "@/components/ui/story"

export default function AboutStory() {
    return (
        <section id="about-story" className="overflow-hidden text-neutral-900 dark:text-neutral-100 h-200">
            <div className="flex w-full h-full justify-center items-center overflow-hidden">
                <Story />
            </div>
        </section>
    )
}
