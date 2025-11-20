export default function AboutBanner() {
    return (
        <section id="about-banner" className="overflow-hidden text-neutral-900 dark:text-neutral-100">
            <div className="flex w-full h-full justify-center items-center pt-25 overflow-hidden">
                <div className="w-400 h-150 bg-[#F2613F] rounded-4xl flex overflow-hidden">
                    <div className="flex w-1/2 h-full flex-col">
                        <div className="flex w-full h-1/2 rounded-tl-4xl overflow-hidden">
                            <div className="flex w-70 h-70 -translate-10">
                                <img src="https://res.cloudinary.com/dykzzd9sy/image/upload/v1763040855/logo_cykuw9.png" alt="website-logo"></img>
                            </div>
                        </div>
                        <div className="flex w-full h-1/2 rounded-bl-4xl justify-center items-center">
                            <div className="flex w-2/3 h-2/3 justify-center items-center">
                                <h1 className="text-8xl font-semibold">About Us</h1>
                            </div>
                        </div>
                    </div>
                    <div className="flex-col w-1/2 h-full">
                        <div className="w-4/5 h-1/3 bg-[#9B3922] rounded-b-3xl z-0 ml-20"></div>
                        <div className="w-3/6 h-2/4 bg-[#481E14] rounded-3xl z-1 ml-86 -translate-y-28"></div>
                        <div className="w-3/6 h-2/4 bg-[#9B3922] rounded-3xl z-2 ml-50 -translate-y-62"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}
