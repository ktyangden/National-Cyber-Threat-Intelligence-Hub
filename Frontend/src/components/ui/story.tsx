import { TextRoll } from "./text-roll";

function Story() {
  return (
    <div className="w-full">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
          <div className="flex flex-col gap-6 max-w-xl text-left">
            <TextRoll className="text-4xl md:text-6xl font-semibold tracking-tight uppercase">
              Our Story
            </TextRoll>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground">
              Our story began in 7th Semester of our B.Tech journey, when six students from completely 
              different specializations decided to build something meaningful together. Coming 
              from Cyber Security, Data Science, Big Data Engineering, and AI/ML, we combined 
              our strengths to create the National Cyber Threat Intelligence Hub as our 
              Capstone II project. What started as a simple idea grew into a unified platform 
              that collects honeypot logs, aggregates external threat intelligence, and 
              applies machine learning to uncover real-time cyber risks. Every part of this
              project reflects our shared curiosity, endless debugging sessions, and the 
              challenge of translating classroom theory into a working system. This is our 
              collaborative effort to learn, build, and leave behind a project we're proud of.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end w-full lg:w-1/2">
            <img src="/about/about-image.png" className="w-64 h-64 sm:w-80 sm:h-80 md:w-[30rem] md:h-[30rem] rounded-2xl object-cover"/>
          </div>

        </div>
      </div>
    </div>
  );
}

export { Story };
