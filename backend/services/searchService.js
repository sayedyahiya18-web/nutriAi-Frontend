class SearchService {
  constructor() {
    this.apiKey = process.env.SCRAPINGDOG_API_KEY;
  }

  async search(query) {
    if (!this.apiKey) {
      console.warn("SCRAPINGDOG_API_KEY is missing. Search disabled.");
      return "";
    }

    try {
      // Scrapingdog Google Search API using native fetch
      const url = `https://api.scrapingdog.com/google?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&results=5`;
      const response = await fetch(url);
      const data = await response.json();

      // Extract snippets from search results
      if (data && data.organic_results) {
        return data.organic_results
          .map(res => `Source: ${res.title}\nSnippet: ${res.snippet}\nLink: ${res.link}`)
          .join('\n\n');
      }

      return "No relevant search results found.";
    } catch (error) {
      console.error("Search Error:", error.message);
      return "Error fetching real-time data.";
    }
  }
}

module.exports = new SearchService();
