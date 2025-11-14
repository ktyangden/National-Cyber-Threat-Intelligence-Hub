import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CallToAction() {
    const navigate = useNavigate();
    return (
        <section id="cta" className="overflow-hidden py-5">
            <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-3xl">
                <h1 className="text-4xl font-bold leading-none sm:text-5xl">Ready to dive deeper?</h1>
                <p className="px-8 mt-8 mb-12 text-xl text-muted-foreground">Explore live threat data and learn how everything works behind the scenes</p>
                <div className="flex gap-4 justify-center items-center flex-col sm:flex-row">
                    <a onClick={() => {navigate("/honeypage")}} className="flex flex-wrap justify-center">
                        <Button className="rounded-3xl text-lg cursor-pointer bg-black dark:bg-white text-white dark:text-black dark:hover:bg-neutral-300 px-6 py-5">Explore Dashboard</Button>
                    </a>
                    <a onClick={() => {navigate("/about")}} className="flex flex-wrap justify-center">
                        <Button className="rounded-3xl text-lg cursor-pointer bg-white dark:bg-black dark:text-primary text-black hover:bg-neutral-200 px-6 py-5 border border-neutral-200 dark:border-neutral-800 dark:hover:bg-neutral-800">Learn More</Button>
                    </a>
                </div>
            </div>
        </section>
    )
}
