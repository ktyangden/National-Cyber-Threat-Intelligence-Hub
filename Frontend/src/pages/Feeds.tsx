import Phishes from './Feeds/Phishes';
import MaliciousUrls from './Feeds/MaliciousUrls';

export default function Feeds() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Threat Intelligence Feeds</h1>
        <p className="text-sm sm:text-lg text-muted-foreground">
          Real-time phishing domain and malicious URL intelligence
        </p>
      </div>
      
      <div className="space-y-12">
        <Phishes />
        <MaliciousUrls />
      </div>
    </div>
  )
}