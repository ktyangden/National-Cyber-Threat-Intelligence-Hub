import { useEffect, useState, useMemo, useCallback } from 'react';
import { AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MaliciousURL {
  url: string;
  threat: string;
  tags: string[];
  reporter: string;
  dateAdded: string;
}

export default function MaliciousUrls() {
  const [urls, setUrls] = useState<MaliciousURL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMaliciousUrls = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use gateway endpoint (via proxy in dev)
      const apiUrl = import.meta.env.DEV 
        ? `/api/v1/ext/malicious-urls`
        : `${import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3002'}/api/v1/ext/malicious-urls`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('URLhaus response:', data);
      
      let urlList: any[] = [];
      
      if (Array.isArray(data)) {
        urlList = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.urls)) {
           urlList = data.urls;
        } else {
           const values = Object.values(data);
           if (values.length > 0 && Array.isArray(values[0])) {
             urlList = values.flat();
           } else {
             urlList = values.filter((item): item is any => 
               typeof item === 'object' && item !== null && 'url' in item
             );
           }
        }
      }
      
      const formattedUrls: MaliciousURL[] = urlList
        .filter((item: any) => {
          return item && 
                 item.url && 
                 typeof item.url === 'string' &&
                 (!item.url_status || item.url_status === 'online');
        })
        .map((item: any) => ({
          url: item.url || '',
          threat: item.threat || item.threat_type || 'Unknown',
          tags: Array.isArray(item.tags) ? item.tags : (item.tags ? [item.tags] : []),
          reporter: item.reporter || 'Anonymous',
          dateAdded: item.dateadded || item.date_added || new Date().toISOString(),
        }))
        .slice(0, 1000); // Limit to 1000 most recent

      setUrls(formattedUrls);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch malicious URLs');
      console.error('Error fetching malicious URLs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaliciousUrls();
  }, [fetchMaliciousUrls]);

  const filteredUrls = useMemo(() => {
    if (!searchQuery.trim()) return urls;
    const query = searchQuery.toLowerCase().trim();
    return urls.filter(item => 
      item.url.toLowerCase().includes(query) ||
      item.threat.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [urls, searchQuery]);

  // Paginate filtered results
  const paginatedUrls = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredUrls.slice(startIndex, endIndex);
  }, [filteredUrls, page, limit]);

  const totalPages = Math.ceil(filteredUrls.length / limit);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Malicious URLs</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Active malicious URLs from URLhaus
              {lastUpdated && (
                <span className="ml-2">
                  • Last fetched: {lastUpdated.toLocaleString()}
                </span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={fetchMaliciousUrls} disabled={loading} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")}/>
          Refresh
        </Button>
      </div>

      {/* Search and Limit Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Search URLs, threats, or tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10"/>
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
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Error loading URLs</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {loading && urls.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading malicious URLs...</span>
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
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Threat Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date Added
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border rounded-lg">
                {paginatedUrls.length === 0 ? (
                  <tr className="block sm:table-row border-b rounded-lg sm:border-0 sm:hover:bg-muted/50 hover:bg-muted/30 transition-colors">
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      {searchQuery ? 'No URLs match your search' : 'No malicious URLs found'}
                    </td>
                  </tr>
                ) : (
                  paginatedUrls.map((item, index) => (
                    <tr key={`${item.url}-${index}`} className="block sm:table-row border-b sm:border-0 sm:hover:bg-muted/50 transition-colors dark:bg-black">
                      <td data-label="#" className="block sm:table-cell px-4 py-2 sm:px-6 sm:py-4 text-sm whitespace-nowrap before:content-[attr(data-label)] before:font-medium before:text-muted-foreground before:inline-block before:pr-3 sm:before:hidden text-muted-foreground">
                        {((page - 1) * limit) + index + 1}
                      </td>
                      <td data-label="URL" className="block sm:table-cell px-4 sm:px-6 pt-2 sm:py-4 text-sm before:content-[attr(data-label)] before:font-medium before:text-muted-foreground before:inline-block before:pr-3 sm:before:hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-foreground truncate max-w-[300px]" title={item.url}>{item.url}</span>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>
                      <td data-label="Threat Type" className="block sm:table-cell px-4 sm:px-6 pt-2 sm:py-4 text-sm whitespace-nowrap before:content-[attr(data-label)] before:font-medium before:text-muted-foreground before:inline-block before:pr-3 sm:before:hidden">
                        <span className="px-2 py-0.5 text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded">
                          {item.threat}
                        </span>
                      </td>
                      <td data-label="Tags" className="block sm:table-cell px-4 sm:px-6 pt-2 sm:py-4 text-sm before:content-[attr(data-label)] before:font-medium before:text-muted-foreground before:inline-block before:pr-3 sm:before:hidden">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="px-1.5 py-0.5 text-xs text-muted-foreground">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label="Reporter" className="block sm:table-cell px-4 sm:px-6 pt-2 sm:py-4 text-sm whitespace-nowrap before:content-[attr(data-label)] before:font-medium before:text-muted-foreground before:inline-block before:pr-3 sm:before:hidden text-muted-foreground">
                        {item.reporter}
                      </td>
                      <td data-label="Date Added" className="block sm:table-cell px-4 sm:px-6 py-2 pb-3 sm:py-4 text-sm whitespace-nowrap before:content-[attr(data-label)] before:font-medium before:text-muted-foreground before:inline-block before:pr-3 sm:before:hidden text-muted-foreground">
                        {formatDate(item.dateAdded)}
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
                <>Showing {paginatedUrls.length} of {filteredUrls.length} {filteredUrls.length === 1 ? 'URL' : 'URLs'} matching "{searchQuery}"</>
              ) : (
                <>Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, filteredUrls.length)} of {filteredUrls.length} {filteredUrls.length === 1 ? 'URL' : 'URLs'}</>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1 || loading} className="gap-1">
                  <ChevronLeft className="h-4 w-4"/>
                  Previous
                </Button>
                <div className="flex items-center gap-1 px-2">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages || loading} className="gap-1">
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
