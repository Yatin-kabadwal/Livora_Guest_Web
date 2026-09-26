import { HeroSection } from '@/components/home/HeroSection';
import { MarqueeStrip, StorySection, StaySection, StatsSection, ExperiencesScroller, DiningTeaser, OffersStrip, LoveSection, LocationSection, FinalCTA } from '@/components/home/Sections';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeStrip />
      <StorySection />
      <StaySection />
      <StatsSection />
      <ExperiencesScroller />
      <DiningTeaser />
      <OffersStrip />
      <LoveSection />
      <LocationSection />
      <FinalCTA />
    </>
  );
}
