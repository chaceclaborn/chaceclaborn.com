import { Hero } from '@/components/home/Hero';
import { QuotesCarousel } from '@/components/home/QuotesCarousel';
import { SolarSystemSection } from '@/components/home/SolarSystemSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SolarSystemSection />
      <QuotesCarousel />
    </>
  );
}
