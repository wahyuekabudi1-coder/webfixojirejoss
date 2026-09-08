import React from 'react';
import ShareTourMain from '../sharetour/App';
import { LanguageCurrencyProvider } from '../sharetour/LanguageCurrencyContext';
import ServiceNavTabs from '../components/ServiceNavTabs';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ShareTourView() {
  return (
    <LanguageCurrencyProvider>
      <div className="bg-[#f8fafc] min-h-screen pt-20 md:pt-24 pb-16">
        <ServiceNavTabs />
        <Breadcrumbs items={[{ label: 'Open Trip / Join Share Tour' }]} />
        <ShareTourMain />
      </div>
    </LanguageCurrencyProvider>
  );
}
