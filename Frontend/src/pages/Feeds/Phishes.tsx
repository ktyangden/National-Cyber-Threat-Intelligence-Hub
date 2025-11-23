import { useEffect, useState, useMemo, useCallback } from 'react';
import { AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PhishingDomain { domain: string, tld: string, status: string }

interface PaginationInfo { total: number, page: number, limit: number, totalPages: number, hasNext: boolean, hasPrev: boolean }

export default function Phishes() {
  const [domains, setDomains] = useState<PhishingDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPhishingDomains = useCallback(async (pageNum: number, limitNum: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use gateway endpoint (via proxy in dev, direct in production)
      const apiUrl = import.meta.env.DEV 
        ? `/api/v1/ext/phishing?page=${pageNum}&limit=${limitNum}`
        : `${import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3002'}/api/v1/ext/phishing?page=${pageNum}&limit=${limitNum}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle response format: { domains: string[], pagination: {...} }
      // Data is an array of domain strings (e.g., "example.com")
      const domainList = Array.isArray(data.domains) ? data.domains : [];
      
      // Extract TLD from domain (e.g., "example.com" -> "com", "sub.example.co.uk" -> "co.uk")
      const extractTLD = (domain: string): string => {
        const parts = domain.split('.');
        if (parts.length >= 2) {
          // Handle common two-part TLDs like .co.uk, .com.au, etc.
          const lastTwo = parts.slice(-2).join('.');
          const commonTwoPartTLDs = ['co.uk', 'com.au', 'co.nz', 'co.za', 'com.br', 'com.mx', 'net.au', 'org.uk', 'com.cn'];
          if (commonTwoPartTLDs.some(tld => lastTwo.includes(tld))) {
            return lastTwo;
          }
          return parts[parts.length - 1];
        }
        return parts[parts.length - 1] || 'unknown';
      };
      
      const formattedDomains: PhishingDomain[] = domainList.map((domain: string) => ({
        domain: domain.trim(),
        tld: extractTLD(domain.trim()),
        status: 'Active',
      }));

      setDomains(formattedDomains);
      setPagination(data.pagination || null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch phishing domains');
      console.error('Error fetching phishing domains:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchPhishingDomains(page, limit);
  }, [fetchPhishingDomains, page, limit]);

  // Filter domains by search query
  const filteredDomains = useMemo(() => {
    if (!searchQuery.trim()) return domains;
    const query = searchQuery.toLowerCase().trim();
    return domains.filter(domain => 
      domain.domain.toLowerCase().includes(query)
    );
  }, [domains, searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Phishing Domains</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Active phishing domains from Phishing.Database
              {lastUpdated && (
                <span className="ml-2">
                  • Last fetched: {lastUpdated.toLocaleString()}
                </span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={() => fetchPhishingDomains(page, limit)} disabled={loading} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")}/>
          Refresh
        </Button>
      </div>

      {/* Search and Limit Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Search domains..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10"/>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">
            Show:
          </label>
          <select value={limit} onChange={(e) => handleLimitChange(Number(e.target.value))} disabled={loading}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Error loading domains</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {loading && domains.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading phishing domains...</span>
        </div>
      ) : (
        <div className="border rounded-lg bg-card max-h-[600px] sm:max-h-[700px] flex flex-col">
          <div className="overflow-x-auto overflow-y-auto flex-1 rounded-lg">
            <table className="w-full rounded-lg">
              <thead className="hidden sm:table-header-group bg-muted sticky top-0 border-b z-10">
                <tr className="block sm:table-row border-b sm:border-0 sm:hover:bg-muted/50 hover:bg-muted/30 transition-colors">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    TLD
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border rounded-lg">
                {filteredDomains.length === 0 ? (
                  <tr className="block sm:table-row border-b rounded-lg sm:border-0 sm:hover:bg-muted/50 hover:bg-muted/30 transition-colors">
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      {searchQuery ? 'No domains match your search' : 'No phishing domains found'}
                    </td>
                  </tr>
                ) : (
                  filteredDomains.map((item, index) => (
                    <tr key={`${item.domain}-${index}`} className="block sm:table-row border-b sm:border-2 sm:hover:bg-muted/50 transition-colors border-muted dark:bg-black">
                      <td data-label="#" className="block sm:table-cell px-4 py-2 sm:px-6 sm:py-4 text-sm whitespace-nowrap before:content-[attr(data-label)] before:font-medium before:text-muted-foreground before:inline-block before:pr-3 sm:before:hidden text-muted-foreground">
                        {((page - 1) * limit) + index + 1}
                      </td>
                      <td data-label="Domain" className="block sm:table-cell px-4 sm:px-6 pt-2 sm:py-4 text-sm whitespace-nowrap before:content-[attr(data-label)] before:font-medium before:text-muted-foreground before:inline-block before:pr-3 sm:before:hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-foreground">{item.domain}</span>
                        </div>
                      </td>
                      <td data-label="TLD" className="block sm:table-cell px-4 sm:px-6 pt-2 sm:py-4 text-sm whitespace-nowrap before:content-[attr(data-label)] before:font-medium before:text-muted-foreground before:inline-block before:pr-3 sm:before:hidden text-muted-foreground">
                        <span className="text-xs font-medium uppercase">{item.tld}</span>
                      </td>
                      <td data-label="Status" className="block sm:table-cell px-4 sm:px-6 py-2 pb-3 sm:py-4 text-sm whitespace-nowrap before:content-[attr(data-label)] before:font-medium before:text-muted-foreground before:inline-block before:pr-3 sm:before:hidden">
                        <span className="px-2 py-0.5 text-xs bg-red-500/10 text-red-600 dark:text-red-400 rounded">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="sticky rounded-b-lg bottom-0 w-full px-6 py-3 bg-muted border-t flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {searchQuery ? (
                <>Showing {filteredDomains.length} of {domains.length} {domains.length === 1 ? 'domain' : 'domains'} matching "{searchQuery}"</>
              ) : pagination ? (
                <>Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} {pagination.total === 1 ? 'domain' : 'domains'}</>
              ) : (
                <>Showing {domains.length} {domains.length === 1 ? 'domain' : 'domains'}</>
              )}
            </div>
            
            {pagination && pagination.totalPages > 1 && !searchQuery && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={!pagination.hasPrev || loading} className="gap-1">
                  <ChevronLeft className="h-4 w-4"/>
                  Previous
                </Button>
                <div className="flex items-center gap-1 px-2">
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={!pagination.hasNext || loading} className="gap-1">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

