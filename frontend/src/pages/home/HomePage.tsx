import { DealsBanner } from './HomePage/DealsBanner';
import { Hero } from './HomePage/Hero';
import { HowItWorks } from './HomePage/HowItWorks';
import { PopularDestinations } from './HomePage/PopularDestinations';
import { TrustBar } from './HomePage/TrustBar';
import { WhyUs } from './HomePage/WhyUs';

export const HomePage = (): JSX.Element => {
  return (
    <>
      <Hero />
      <TrustBar />
      <PopularDestinations />
      <HowItWorks />
      <WhyUs />
      <DealsBanner />
    </>
  );
};
