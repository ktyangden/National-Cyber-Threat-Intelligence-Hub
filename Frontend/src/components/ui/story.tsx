import { TextRoll } from "./text-roll";
import { StackedCardsInteraction } from "./stacked-cards-interaction";

function Story() {
  return (
    <div className="w-full h-full mt-20 sm:mt-45">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
          <div className="flex flex-col gap-6 max-w-xl text-left h-full">
            <TextRoll className="text-4xl sm:text-6xl font-semibold tracking-tight uppercase text-center xl:text-left">
              Our Story
            </TextRoll>
            <p className="text-base sm:text-xl leading-relaxed text-muted-foreground text-center xl:text-left">
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
          <div className="hidden xl:flex justify-center lg:justify-end w-0 h-0 lg:w-1/2">
            <StackedCardsInteraction
              cards={[
                {
                  image: "https://res.cloudinary.com/dykzzd9sy/image/upload/v1763826578/work_grnfnn.webp",
                  title: "THREAT VISTA",
                },
                {
                  image: "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  title: "Card 2",
                },
                {
                  image: "https://images.unsplash.com/photo-1526827826797-7b05204a22ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDExfHx8ZW58MHx8fHx8",
                  title: "Card 3",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { Story };
