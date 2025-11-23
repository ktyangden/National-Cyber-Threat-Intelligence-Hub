import { useState } from 'react';
import Phishes from './Feeds/Phishes';
import Map from './Feeds/Map';
import { Button } from '@/components/ui/button';

export default function Feeds() {
  const [activeTab, setActiveTab] = useState<'phishes' | 'map'>('phishes');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Threat Intelligence Feeds</h1>
        <p className="text-sm sm:text-lg text-muted-foreground">
          Real-time threat data from various intelligence sources
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b">
        <Button variant={activeTab === 'phishes' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('phishes')} className="rounded-b-none"
        >
          Phishing Domains
        </Button>
        <Button variant={activeTab === 'map' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('map')} className="rounded-b-none"
        >
          Attack Heatmap
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'phishes' && <Phishes />}
      {activeTab === 'map' && <Map />}
    </div>
  )
}
