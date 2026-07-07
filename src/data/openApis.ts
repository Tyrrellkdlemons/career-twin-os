export type OpenApiAuth = "none" | "free-key" | "registered";
export type CareerApiUseCase = "market" | "occupation" | "skills" | "evidence" | "education" | "research" | "jobs" | "macro";

export interface OpenApiSource {
  id: string;
  name: string;
  provider: string;
  docsUrl: string;
  baseUrl: string;
  auth: OpenApiAuth;
  license: string;
  careerUseCases: CareerApiUseCase[];
  tags: string[];
  bestFor: string[];
  limitations: string[];
  disallowedUseCases: string[];
  integrationMode: "client-safe" | "server-side";
}

export const openApiCatalog: OpenApiSource[] = [
  {
    id: "bls-public-data",
    name: "BLS Public Data API",
    provider: "U.S. Bureau of Labor Statistics",
    docsUrl: "https://www.bls.gov/developers/",
    baseUrl: "https://api.bls.gov/publicAPI/v2/",
    auth: "free-key",
    license: "U.S. public data",
    careerUseCases: ["market", "macro"],
    tags: ["labor", "employment", "wages", "occupation", "market", "time series"],
    bestFor: ["Labor-market trend context", "Employment and wage series where exact series IDs are selected", "Scenario assumptions"],
    limitations: ["Requires careful series selection", "Registered users get higher limits", "Should not be used for individual outcome guarantees"],
    disallowedUseCases: ["Scrape private job platforms", "Guarantee salary outcomes", "Infer individual hiring probability"],
    integrationMode: "server-side"
  },
  {
    id: "onet-web-services",
    name: "O*NET Web Services",
    provider: "O*NET Center",
    docsUrl: "https://services.onetcenter.org/reference/",
    baseUrl: "https://services.onetcenter.org/ws/",
    auth: "registered",
    license: "O*NET developer terms",
    careerUseCases: ["occupation", "skills", "market"],
    tags: ["occupation", "skills", "knowledge", "technology", "interest", "career", "labor"],
    bestFor: ["Occupation requirements", "Skill and knowledge mapping", "Related occupations", "Interest profiler workflows"],
    limitations: ["Requires developer credentials", "Credentials must stay server-side", "Occupation matching needs explicit code binding"],
    disallowedUseCases: ["Scrape private job platforms", "Represent self-reported skills as verified", "Display uncited precision"],
    integrationMode: "server-side"
  },
  {
    id: "github-rest",
    name: "GitHub REST API",
    provider: "GitHub",
    docsUrl: "https://docs.github.com/rest",
    baseUrl: "https://api.github.com/",
    auth: "none",
    license: "GitHub API terms",
    careerUseCases: ["evidence", "skills"],
    tags: ["portfolio", "repository", "readme", "languages", "evidence", "code", "public repos"],
    bestFor: ["Public repository metadata", "README and language signals", "Portfolio evidence support labels"],
    limitations: ["Unauthenticated rate limits are lower", "Public metadata is not proof that code runs", "Never execute repository code server-side"],
    disallowedUseCases: ["Scrape private job platforms", "Execute arbitrary repository code", "Call public metadata verified without validation"],
    integrationMode: "client-safe"
  },
  {
    id: "college-scorecard",
    name: "College Scorecard API",
    provider: "U.S. Department of Education",
    docsUrl: "https://collegescorecard.ed.gov/data/api-documentation/",
    baseUrl: "https://api.data.gov/ed/collegescorecard/v1/",
    auth: "free-key",
    license: "U.S. public data",
    careerUseCases: ["education"],
    tags: ["education", "programs", "cost", "graduation", "earnings", "school"],
    bestFor: ["Education program cost context", "Institution-level comparison", "Degree-route assumptions"],
    limitations: ["Requires API key", "Institution data is not a personal career prediction", "Program matching must be explicit"],
    disallowedUseCases: ["Scrape private job platforms", "Guarantee earnings", "Treat institution data as admission advice"],
    integrationMode: "server-side"
  },
  {
    id: "openalex",
    name: "OpenAlex API",
    provider: "OurResearch",
    docsUrl: "https://developers.openalex.org/api-reference/introduction",
    baseUrl: "https://api.openalex.org/",
    auth: "none",
    license: "Open data catalog",
    careerUseCases: ["research", "education"],
    tags: ["research", "scholarly works", "institutions", "topics", "education", "open"],
    bestFor: ["Researching emerging role topics", "Mapping learning areas to scholarly topics", "Source discovery for advanced skills"],
    limitations: ["Not a labor-market database", "Topic relevance needs interpretation", "Use polite pool contact when scaling"],
    disallowedUseCases: ["Scrape private job platforms", "Misrepresent papers as job demand", "Use citation counts as skill proof"],
    integrationMode: "client-safe"
  },
  {
    id: "world-bank-indicators",
    name: "World Bank Indicators API",
    provider: "World Bank",
    docsUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    baseUrl: "https://api.worldbank.org/v2/",
    auth: "none",
    license: "World Bank open data terms",
    careerUseCases: ["market", "macro"],
    tags: ["macro", "country", "education", "labor", "economy", "indicators"],
    bestFor: ["Macro scenario context", "Country-level education and labor indicators", "Global relocation assumptions"],
    limitations: ["Macro signals are not individual predictions", "Some indicators lag", "Requires indicator selection"],
    disallowedUseCases: ["Scrape private job platforms", "Make individual employment guarantees", "Replace local labor-market data"],
    integrationMode: "client-safe"
  },
  {
    id: "usajobs",
    name: "USAJOBS API",
    provider: "U.S. Office of Personnel Management",
    docsUrl: "https://developer.usajobs.gov/api-reference/",
    baseUrl: "https://data.usajobs.gov/api/",
    auth: "free-key",
    license: "U.S. government API terms",
    careerUseCases: ["jobs", "market"],
    tags: ["federal jobs", "open roles", "occupation", "location", "hiring"],
    bestFor: ["Federal opportunity exploration", "Role text examples", "Location and agency filters"],
    limitations: ["Search requires API key", "Open announcements are not generalized market demand", "Respect API terms"],
    disallowedUseCases: ["Scrape private job platforms", "Auto-apply without user action", "Spam employers"],
    integrationMode: "server-side"
  },
  {
    id: "datagov-ckan",
    name: "Data.gov CKAN API",
    provider: "General Services Administration",
    docsUrl: "https://catalog.data.gov/dataset/data-gov-ckan-api",
    baseUrl: "https://catalog.data.gov/api/3/",
    auth: "none",
    license: "Public metadata catalog",
    careerUseCases: ["research", "market", "education"],
    tags: ["open data", "metadata", "government datasets", "catalog", "ckan"],
    bestFor: ["Discovering datasets", "Finding official source candidates", "Research backlog generation"],
    limitations: ["Catalog metadata only", "Dataset quality varies", "Actual data may live elsewhere"],
    disallowedUseCases: ["Scrape private job platforms", "Assume metadata equals data quality", "Bypass source-specific terms"],
    integrationMode: "client-safe"
  }
];

export function findOpenApis(query: string, filters: { auth?: OpenApiAuth; useCase?: CareerApiUseCase } = {}): OpenApiSource[] {
  const tokens = query
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);

  return openApiCatalog
    .filter((api) => (filters.auth ? api.auth === filters.auth : true))
    .filter((api) => (filters.useCase ? api.careerUseCases.includes(filters.useCase) : true))
    .map((api) => ({ api, score: scoreApi(api, tokens) }))
    .filter(({ score }) => score > 0 || tokens.length === 0)
    .sort((a, b) => b.score - a.score || a.api.name.localeCompare(b.api.name))
    .map(({ api }) => api);
}

export function getApisByCareerUse(useCase: CareerApiUseCase): OpenApiSource[] {
  return findOpenApis("", { useCase });
}

function scoreApi(api: OpenApiSource, tokens: string[]): number {
  if (tokens.length === 0) {
    return api.auth === "none" ? 2 : 1;
  }

  const haystack = [
    api.name,
    api.provider,
    api.license,
    ...api.tags,
    ...api.bestFor,
    ...api.careerUseCases,
    ...api.limitations
  ]
    .join(" ")
    .toLowerCase();

  return tokens.reduce((score, token) => {
    if (api.name.toLowerCase().includes(token)) return score + 6;
    if (api.careerUseCases.some((useCase) => useCase.includes(token))) return score + 5;
    if (api.tags.some((tag) => tag.includes(token))) return score + 4;
    if (haystack.includes(token)) return score + 2;
    return score;
  }, 0);
}
