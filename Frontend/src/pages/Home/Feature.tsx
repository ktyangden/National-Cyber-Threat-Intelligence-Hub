import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
export interface FeatureProps { imgSrc: string; imgAlt?: string; title: string; description: string; linkHref: string; linkText: string; reverse?: boolean; }

export default function Feature({ imgSrc, imgAlt="", title, description, linkHref, linkText, reverse = false }: FeatureProps) {
    return (
    <div className={`flex flex-col overflow-hidden rounded-md gap-x-5 lg:flex-row ` + (reverse ? "lg:flex-row-reverse" : "")}>
        <img src={imgSrc} alt={imgAlt} className="h-64 sm:h-80 w-full object-cover lg:w-1/2" />
        <div className="flex flex-col justify-center flex-1 p-4 sm:p-6 text-center xl:text-left md:text-left sm:text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h3>
            <p className="my-4 sm:my-6 font-normal text-muted-foreground text-xl">
            {description}
            </p>
            <div className="flex justify-center sm:justify-center md:justify-start xl:justify-start">
            <a href={linkHref} className="flex flex-wrap justify-center">
                <InteractiveHoverButton>{linkText}</InteractiveHoverButton>
            </a>
            </div>  
        </div>
    </div>
  );
}
