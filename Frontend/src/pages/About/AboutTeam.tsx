import ProfileCard from "@/components/ProfileCard";
import { TextRoll } from "@/components/ui/text-roll";

export default function AboutTeam() {
  return (
    <section id="about-team" className="overflow-hidden text-neutral-900 dark:text-neutral-100 my-15 flex flex-col items-center">
        <div className="w-full flex justify-center items-center">
            <TextRoll className="text-4xl sm:text-6xl mt-12 font-semibold uppercase leading-[0.8] tracking-[-0.03em] transition-colors cursor-default text-center">Our Team</TextRoll>
        </div>

        <div className="w-full flex py-20 justify-center">
            <div className="max-w-7xl w-full flex flex-wrap items-center justify-center gap-10">
                <ProfileCard profileImg="https://avatars.githubusercontent.com/u/151437546?v=4" 
                    profileLink="https://github.com/Kanishak-xd" profileName="Kanishak Sharma"
                />
                <ProfileCard profileImg="https://avatars.githubusercontent.com/u/78788104?v=4" 
                    profileLink="https://github.com/ktyangden" profileName="Karma Yangden"
                />
                <ProfileCard profileImg="https://avatars.githubusercontent.com/u/128486662?v=4" 
                    profileLink="https://github.com/VK-627" profileName="Vishwas Kaushik"
                />
                <ProfileCard profileImg="https://avatars.githubusercontent.com/u/194140611?v=4" 
                    profileLink="https://github.com/mohitkhandal22" profileName="Mohit Khindal"
                />
                <ProfileCard profileImg="https://avatars.githubusercontent.com/u/190525789?v=4" 
                    profileLink="https://github.com/Harshwardhan199" profileName="Harshwardhan Saini"
                />
                <ProfileCard profileImg="https://avatars.githubusercontent.com/u/136967302?v=4" 
                    profileLink="https://github.com/rakshitsawarn" profileName="Rakshit Sawarn"
                />
            </div>
        </div>    
    </section>
  );
}
