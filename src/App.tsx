import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Clipboard,
  Clock3,
  Download,
  FileText,
  GitBranch,
  Home,
  Layers3,
  Map,
  MessageSquare,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Upload,
  UserRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { Link, NavLink, Route as RouterRoute, Routes, useLocation } from "react-router-dom";
import { demoProfile } from "./data/demoProfile";
import { roleCatalog, skillLabels } from "./data/occupations";
import { findOpenApis, getApisByCareerUse, openApiCatalog, type CareerApiUseCase, type OpenApiAuth } from "./data/openApis";
import {
  applyShockScenario,
  calculateReadiness,
  explainScore,
  generateMission,
  runCareerSimulation
} from "./services/simulation";
import { classifyEvidence, parseGitHubRepositoryUrl } from "./services/simulation/evidence";
import { getPublicMarketSignal, summarizePublicSignal, type PublicMarketSignal } from "./services/market/publicMarketClient";
import type { CareerConstraints, CareerProfile, CareerRoute, DecisionRecord, ShockScenario, SkillId } from "./types";

const navItems = [
  { to: "/overview", label: "Overview", icon: Home },
  { to: "/time-machine", label: "Time Machine", icon: GitBranch },
  { to: "/path-race", label: "Path Race", icon: Route },
  { to: "/evidence", label: "Evidence Map", icon: Radar },
  { to: "/api-finder", label: "API Finder", icon: Layers3 },
  { to: "/missions", label: "Missions", icon: Target },
  { to: "/future-self", label: "Future Self", icon: MessageSquare },
  { to: "/decisions", label: "Decisions", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: UserRound }
];

const mobileItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/simulate", label: "Simulate", icon: Sparkles },
  { to: "/path-race", label: "Paths", icon: Route },
  { to: "/missions", label: "Missions", icon: Target },
  { to: "/profile", label: "Profile", icon: UserRound }
];

function App() {
  const location = useLocation();
  const showcase = new URLSearchParams(location.search).get("showcase") === "1";
  const [profile, setProfile] = useState<CareerProfile>(demoProfile);
  const [constraints, setConstraints] = useState<CareerConstraints>(demoProfile.constraints);
  const [shocks, setShocks] = useState<ShockScenario>({});
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [publicSignal, setPublicSignal] = useState<PublicMarketSignal | null>(null);
  const simulation = useMemo(
    () =>
      runCareerSimulation(profile, {
        constraints,
        shocks,
        seed: `${profile.id}:${constraints.hoursPerWeek}:${constraints.monthlyBudget}:${JSON.stringify(shocks)}`
      }),
    [constraints, profile, shocks]
  );
  const topRoute = simulation.routes[0];
  const mission = useMemo(() => generateMission("cloud-deployment-evidence", profile), [profile]);

  useEffect(() => {
    let active = true;

    getPublicMarketSignal(topRoute.targetRole).then((signal) => {
      if (active) {
        setPublicSignal(signal);
      }
    });

    return () => {
      active = false;
    };
  }, [topRoute.targetRole]);

  const appState = { profile, setProfile, constraints, setConstraints, shocks, setShocks, simulation, topRoute, mission, showcase, decisions, setDecisions, publicSignal };
  const modeTitle = publicSignal?.mode === "PUBLIC_DATA_LIVE_MODE" ? "Live Public Data Mode" : publicSignal?.mode === "PUBLIC_DATA_DEGRADED_MODE" ? "Public Data Partial Mode" : "Public Data Router";
  const modeSummary = publicSignal ? summarizePublicSignal(publicSignal) : "Connecting GitHub, OpenAlex, World Bank, and Data.gov resources.";

  return (
    <div className="app-shell">
      <MotionBackdrop />
      <aside className="sidebar" aria-label="Primary">
        <Link className="brand" to={withShowcase("/", showcase)}>
          <span className="brand-mark">CT</span>
          <span>
            <strong>CareerTwin OS</strong>
            <small>Future Simulation Engine</small>
          </span>
        </Link>
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={withShowcase(item.to, showcase)} className={({ isActive }) => (isActive ? "active" : "")}>
              <item.icon size={18} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mode-panel">
          <ShieldCheck size={18} aria-hidden="true" />
          <div>
            <strong>{modeTitle}</strong>
            <span>{modeSummary}</span>
          </div>
        </div>
      </aside>

      <main className="main-surface">
        <Routes>
          <RouterRoute path="/" element={<HomePage {...appState} />} />
          <RouterRoute path="/overview" element={<OverviewPage {...appState} />} />
          <RouterRoute path="/build-twin" element={<BuildTwinPage {...appState} />} />
          <RouterRoute path="/simulate" element={<SimulatePage {...appState} />} />
          <RouterRoute path="/time-machine" element={<TimeMachinePage {...appState} />} />
          <RouterRoute path="/path-race" element={<PathRacePage {...appState} />} />
          <RouterRoute path="/evidence" element={<EvidencePage {...appState} />} />
          <RouterRoute path="/api-finder" element={<ApiFinderPage publicSignal={publicSignal} />} />
          <RouterRoute path="/missions" element={<MissionsPage {...appState} />} />
          <RouterRoute path="/future-self" element={<FutureSelfPage {...appState} />} />
          <RouterRoute path="/decisions" element={<DecisionsPage {...appState} />} />
          <RouterRoute path="/profile" element={<ProfilePage {...appState} />} />
          <RouterRoute path="/replay" element={<ReplayPage {...appState} />} />
        </Routes>
      </main>

      <nav className="mobile-nav" aria-label="mobile navigation">
        {mobileItems.map((item) => (
          <NavLink key={item.to} to={withShowcase(item.to, showcase)} className={({ isActive }) => (isActive ? "active" : "")}>
            <item.icon size={19} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function MotionBackdrop() {
  return (
    <div className="motion-field" aria-hidden="true">
      {Array.from({ length: 10 }, (_, index) => (
        <span key={index} style={{ "--i": index } as CSSProperties} />
      ))}
    </div>
  );
}

interface AppPageProps {
  profile: CareerProfile;
  setProfile: (profile: CareerProfile) => void;
  constraints: CareerConstraints;
  setConstraints: (constraints: CareerConstraints) => void;
  shocks: ShockScenario;
  setShocks: (shocks: ShockScenario) => void;
  simulation: ReturnType<typeof runCareerSimulation>;
  topRoute: CareerRoute;
  mission: ReturnType<typeof generateMission>;
  showcase: boolean;
  decisions: DecisionRecord[];
  setDecisions: (decisions: DecisionRecord[]) => void;
  publicSignal: PublicMarketSignal | null;
}

function withShowcase(path: string, showcase: boolean) {
  return showcase ? `${path}?showcase=1` : path;
}

function PageHeader({
  eyebrow,
  title,
  children,
  icon
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="header-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
      <div className="header-icon" aria-hidden="true">
        {icon}
      </div>
    </header>
  );
}

function MetricTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="metric-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="score-row">
      <span>{label}</span>
      <div className="score-track" aria-hidden="true">
        <div style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function RouteCard({ route, compact = false }: { route: CareerRoute; compact?: boolean }) {
  const role = roleCatalog[route.targetRole];
  return (
    <article className={`route-card ${route.strategy}`}>
      <div className="route-card-head">
        <span>{route.strategy.replace("-", " ")}</span>
        <strong>{route.score.overall}</strong>
      </div>
      <h3>{route.title}</h3>
      <p>{role.summary}</p>
      <div className="route-facts">
        <span>
          <Clock3 size={15} aria-hidden="true" />
          {route.uncertaintyBand.lowMonths}-{route.uncertaintyBand.highMonths} months
        </span>
        <span>${route.costBand.min}-${route.costBand.max}</span>
        <span>{route.weeklyHours} h/wk</span>
      </div>
      {!compact && (
        <>
          <ScoreBar label="Evidence" value={route.score.evidenceCoverage} />
          <ScoreBar label="Constraint fit" value={route.score.constraintFit} />
          <details>
            <summary>Explain this score</summary>
            <ul>
              {explainScore(route).map((item) => (
                <li key={item.label}>
                  <strong>{item.value}</strong> {item.explanation}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </article>
  );
}

function HomePage({ profile, topRoute, showcase }: AppPageProps) {
  return (
    <section className="home-page">
      <div className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Future Simulation Engine</span>
          <h1>CareerTwin OS</h1>
          <p className="hero-line">Do not guess your next move. Simulate it.</p>
          <p>
            CareerTwin OS models skills, evidence, goals, time, budget, and constraints to simulate competing career futures, then turns the strongest route into actions a user can complete.
          </p>
          {showcase && <p className="showcase-note">Fictional demo twin loaded for showcase reviewers: {profile.name}.</p>}
          <div className="hero-actions">
            <Link className="primary-action" to={withShowcase("/simulate", showcase)}>
              Simulate my future <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="secondary-action" to={withShowcase("/overview", showcase)}>
              Explore demo twin
            </Link>
          </div>
        </div>
        <MiniTimeline route={topRoute} />
      </div>

      <section className="difference-band">
        <article>
          <span>Traditional career tools</span>
          <p>"Here are jobs you may like."</p>
        </article>
        <article>
          <span>CareerTwin OS</span>
          <p>"Here are possible futures, the assumptions behind them, what each costs, what could break the plan, and what to do this week."</p>
        </article>
      </section>

      <section className="feature-strip">
        {[
          ["Career Time Machine", "Branching temporal map across 6, 12, 24, and 36 months."],
          ["Career Physics", "Constraints change routes, scores, effort, and bottlenecks."],
          ["Open API Finder", "Official and open data sources mapped to simulation use cases."],
          ["Proof Missions", "Skill gaps become portfolio artifacts with acceptance criteria."],
          ["Future Self", "Reflective simulation grounded in the selected path."]
        ].map(([title, body]) => (
          <article key={title} className="feature-card">
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </section>
  );
}

function ApiFinderPage({ publicSignal }: Pick<AppPageProps, "publicSignal">) {
  const [query, setQuery] = useState("career labor skills");
  const [auth, setAuth] = useState<OpenApiAuth | "all">("all");
  const [useCase, setUseCase] = useState<CareerApiUseCase>("market");
  const results = useMemo(() => {
    const filters = auth === "all" ? { useCase } : { auth, useCase };
    const found = findOpenApis(query, filters);
    return found.length ? found : auth === "all" ? getApisByCareerUse(useCase) : openApiCatalog.filter((api) => api.auth === auth);
  }, [auth, query, useCase]);

  return (
    <>
      <PageHeader eyebrow="Open Source API Discovery" title="Open API Finder" icon={<Layers3 size={42} />}>
        Find official, open, or free-key data sources that can enrich simulations without scraping private job platforms or exposing secrets in the browser.
      </PageHeader>
      <section className="api-finder-layout">
        <div className="work-panel api-controls">
          <label>
            Search APIs
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="labor skills, portfolio evidence, education cost" />
          </label>
          <div className="segmented-row" role="group" aria-label="Authentication filter">
            <button className={auth === "all" ? "selected" : ""} type="button" onClick={() => setAuth("all")}>
              All APIs
            </button>
            <button className={auth === "none" ? "selected" : ""} type="button" onClick={() => setAuth("none")}>
              No-key only
            </button>
            <button className={auth === "free-key" ? "selected" : ""} type="button" onClick={() => setAuth("free-key")}>
              Free-key
            </button>
            <button className={auth === "registered" ? "selected" : ""} type="button" onClick={() => setAuth("registered")}>
              Registered
            </button>
          </div>
          <div className="usecase-grid" role="group" aria-label="Career use case">
            {(["market", "occupation", "skills", "evidence", "education", "research", "jobs", "macro"] as CareerApiUseCase[]).map((item) => (
              <button className={useCase === item ? "selected" : ""} key={item} type="button" onClick={() => setUseCase(item)}>
                {titleCase(item)}
              </button>
            ))}
          </div>
          <ApiSourceMap />
          <PublicDataStatus signal={publicSignal} />
        </div>
        <div className="api-grid" aria-live="polite">
          {results.map((api, index) => (
            <article className="api-card" key={api.id} style={{ "--delay": `${index * 80}ms` } as CSSProperties}>
              <div className="api-card-top">
                <span>{api.provider}</span>
                <strong>{api.auth === "none" ? "No key" : api.auth === "free-key" ? "Free key" : "Registered"}</strong>
              </div>
              <h2>{api.name}</h2>
              <p>{api.bestFor[0]}</p>
              <dl>
                <div>
                  <dt>Use cases</dt>
                  <dd>{api.careerUseCases.join(", ")}</dd>
                </div>
                <div>
                  <dt>Integration</dt>
                  <dd>{api.integrationMode}</dd>
                </div>
                <div>
                  <dt>Base URL</dt>
                  <dd>{api.baseUrl}</dd>
                </div>
              </dl>
              <ul>
                {api.limitations.slice(0, 2).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a className="secondary-action" href={api.docsUrl} target="_blank" rel="noreferrer">
                Open docs <ArrowRight size={16} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function PublicDataStatus({ signal }: { signal: PublicMarketSignal | null }) {
  const liveSources = signal?.sources.filter((source) => source.status === "live") ?? [];
  const modeLabel =
    signal?.mode === "PUBLIC_DATA_LIVE_MODE"
      ? "Live public data"
      : signal?.mode === "PUBLIC_DATA_DEGRADED_MODE"
        ? "Partial public data"
        : signal?.mode === "PUBLIC_DATA_OFFLINE_MODE"
          ? "Public data offline"
          : "Public data router";

  return (
    <section className="public-data-status" aria-label="Live public data status">
      <div className="panel-title">
        <Activity size={18} aria-hidden="true" />
        <span>{modeLabel}</span>
      </div>
      <p>{signal ? summarizePublicSignal(signal) : "Connecting public resources through the Netlify market function."}</p>
      {signal ? (
        <>
          <div className="signal-meter" aria-label={`Market signal ${signal.marketSignal} out of 100`}>
            <span style={{ width: `${signal.marketSignal}%` }} />
          </div>
          <div className="source-status-list">
            {signal.sources.map((source) => (
              <div className={`source-status-row ${source.status}`} key={source.id}>
                <strong>{source.name}</strong>
                <span>{source.status === "live" ? source.signal : "Waiting for source response"}</span>
              </div>
            ))}
            {liveSources.length === 0 ? <small>Live public resources will appear here once `/api/market` responds.</small> : null}
          </div>
        </>
      ) : null}
    </section>
  );
}

function ApiSourceMap() {
  return (
    <svg className="api-source-map" viewBox="0 0 520 240" role="img" aria-label="Open APIs feed the simulation engine through a source router">
      <path className="route-line primary api-flow" d="M50 60 C160 35 235 70 330 55 S450 48 490 78" />
      <path className="route-line violet api-flow" d="M50 120 C155 118 238 118 330 120 S455 126 490 110" />
      <path className="route-line amber api-flow" d="M50 180 C160 205 245 170 330 190 S450 182 490 158" />
      <GraphNode x={56} y={60} label="Labor" kind="role" />
      <GraphNode x={56} y={120} label="Evidence" kind="evidence" />
      <GraphNode x={56} y={180} label="Education" kind="skill" />
      <GraphNode x={288} y={120} label="Source router" kind="opportunity" />
      <GraphNode x={470} y={120} label="Simulation" kind="evidence" />
    </svg>
  );
}

function MiniTimeline({ route }: { route: CareerRoute }) {
  const [month, setMonth] = useState(12);
  const activated = route.milestones.filter((milestone) => milestone.month <= month).length;
  return (
    <div className="timeline-panel" aria-label="Interactive mini career timeline">
      <div className="panel-title">
        <GitBranch size={18} aria-hidden="true" />
        <span>Temporal map</span>
      </div>
      <svg className="mini-map" viewBox="0 0 640 360" role="img" aria-label="Present state branches into cloud, automation, and solutions futures">
        <path className="topo-line" d="M40 280 C160 240 240 300 360 245 S540 190 610 235" />
        <path className="route-line primary" d="M300 185 C360 120 430 92 560 62" />
        <path className="route-line violet" d="M300 185 C385 178 455 180 590 170" />
        <path className="route-line amber" d="M300 185 C370 242 460 275 585 304" />
        <circle className="node present" cx="300" cy="185" r="22" />
        <circle className={activated >= 1 ? "node active" : "node"} cx="395" cy="120" r="13" />
        <circle className={activated >= 2 ? "node active" : "node"} cx="470" cy="92" r="13" />
        <circle className={activated >= 3 ? "node active" : "node"} cx="560" cy="62" r="17" />
        <circle className="node alt" cx="590" cy="170" r="15" />
        <circle className="node risk" cx="585" cy="304" r="15" />
        <text x="262" y="190">NOW</text>
        <text x="503" y="43">Cloud path</text>
        <text x="505" y="158">AI automation</text>
        <text x="486" y="328">Shock route</text>
      </svg>
      <label className="range-control">
        <span>Timeline: {month}M</span>
        <input type="range" min="0" max="36" step="6" value={month} onChange={(event) => setMonth(Number(event.target.value))} />
      </label>
      <p>{activated} milestones activated. {route.title} remains confidence-limited by {route.bottleneck.toLowerCase()}.</p>
    </div>
  );
}

function OverviewPage({ profile, topRoute, mission, showcase }: AppPageProps) {
  const readiness = calculateReadiness(profile, topRoute.targetRole);
  return (
    <>
      <PageHeader eyebrow="Overview" title="Where am I, where could I go, and what should happen next?" icon={<BarChart3 size={42} />}>
        The overview keeps the user's current twin, most likely route, biggest bottleneck, next mission, and sensitivity in one work-focused screen.
      </PageHeader>
      <section className="metrics-grid">
        <MetricTile label="Twin readiness" value={`${readiness.overall}/100`} hint={roleCatalog[topRoute.targetRole].title} />
        <MetricTile label="Target path" value={topRoute.title} hint={`${topRoute.uncertaintyBand.lowMonths}-${topRoute.uncertaintyBand.highMonths} month band`} />
        <MetricTile label="Biggest bottleneck" value={topRoute.bottleneck} hint="Evidence first, activity second" />
        <MetricTile label="Next mission" value={mission.title} hint={mission.estimatedHours} />
      </section>
      <section className="two-column">
        <div className="work-panel">
          <h2>Current Twin</h2>
          <p>{profile.name} is a fictional demo profile with IT support, customer-facing technology work, Python fundamentals, and small deployed projects.</p>
          <EvidenceList profile={profile} />
        </div>
        <div className="work-panel">
          <h2>Recommended next action</h2>
          <RouteCard route={topRoute} />
          <Link className="primary-action inline-action" to={withShowcase("/simulate", showcase)}>
            Run new simulation <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}

function BuildTwinPage({ profile, setProfile }: AppPageProps) {
  const [resume, setResume] = useState("");
  const extracted = useMemo(() => parseResumeFacts(resume), [resume]);

  return (
    <>
      <PageHeader eyebrow="Build My Twin" title="Confirm what the Twin thinks is true" icon={<Upload size={42} />}>
        Resume text, TXT, PDF, and manual entry can feed the model. AI-extracted claims are treated as draft facts until the user confirms them.
      </PageHeader>
      <section className="two-column">
        <form className="work-panel" onSubmit={(event) => event.preventDefault()}>
          <label>
            Paste resume text
            <textarea value={resume} onChange={(event) => setResume(event.target.value)} placeholder="Paste a resume, profile, or notes here." />
          </label>
          <div className="file-row">
            <button className="secondary-action" type="button">
              <FileText size={16} aria-hidden="true" />
              PDF upload prepared
            </button>
            <button className="secondary-action" type="button">
              <Upload size={16} aria-hidden="true" />
              TXT upload prepared
            </button>
          </div>
        </form>
        <div className="work-panel">
          <h2>Here is what your Twin thinks is true</h2>
          <ul className="fact-list">
            {extracted.length ? extracted.map((fact) => <li key={fact}>{fact}</li>) : profile.background.map((fact) => <li key={fact}>{fact}</li>)}
          </ul>
          <button
            className="primary-action"
            type="button"
            onClick={() =>
              setProfile({
                ...profile,
                background: extracted.length ? extracted : profile.background
              })
            }
          >
            Confirm draft facts
          </button>
        </div>
      </section>
    </>
  );
}

function SimulatePage({ profile, constraints, setConstraints, shocks, setShocks, simulation }: AppPageProps) {
  const shockResult = applyShockScenario(profile, constraints, shocks);
  return (
    <>
      <PageHeader eyebrow="Simulate" title="Simulate competing futures" icon={<Sparkles size={42} />}>
        Generate contrasting routes around time, budget, geography, risk, and proof requirements. Scenario simulation, not a guarantee or prediction.
      </PageHeader>
      <section className="sim-controls">
        <label>
          <span>Hours per week: {constraints.hoursPerWeek}</span>
          <input
            type="range"
            min="4"
            max="24"
            value={constraints.hoursPerWeek}
            onChange={(event) => setConstraints({ ...constraints, hoursPerWeek: Number(event.target.value) })}
          />
        </label>
        <label>
          <span>Monthly budget: ${constraints.monthlyBudget}</span>
          <input
            type="range"
            min="0"
            max="2000"
            step="50"
            value={constraints.monthlyBudget}
            onChange={(event) => setConstraints({ ...constraints, monthlyBudget: Number(event.target.value) })}
          />
        </label>
        <fieldset>
          <legend>Future Shock Lab</legend>
          <ShockToggle label="AI adoption accelerates" id="aiAdoptionAccelerates" shocks={shocks} setShocks={setShocks} />
          <ShockToggle label="Hiring slows" id="hiringSlows" shocks={shocks} setShocks={setShocks} />
          <ShockToggle label="Learning hours double" id="learningHoursDouble" shocks={shocks} setShocks={setShocks} />
          <ShockToggle label="Project portfolio strengthened" id="projectPortfolioStrengthened" shocks={shocks} setShocks={setShocks} />
        </fieldset>
      </section>
      <div className="assumption-bar">
        {shockResult.assumptions.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <section className="route-grid">
        {simulation.routes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </section>
    </>
  );
}

function ShockToggle({
  label,
  id,
  shocks,
  setShocks
}: {
  label: string;
  id: keyof ShockScenario;
  shocks: ShockScenario;
  setShocks: (shocks: ShockScenario) => void;
}) {
  return (
    <label className="toggle-row">
      <input type="checkbox" checked={Boolean(shocks[id])} onChange={(event) => setShocks({ ...shocks, [id]: event.target.checked })} />
      <span>{label}</span>
    </label>
  );
}

function TimeMachinePage({ simulation }: AppPageProps) {
  const [month, setMonth] = useState(12);
  const [zoom, setZoom] = useState(1);
  const route = simulation.routes[0];
  return (
    <>
      <PageHeader eyebrow="Career Time Machine" title="Career Time Machine" icon={<Map size={42} />}>
        Drag the timeline to watch milestones, skills, evidence nodes, risks, and alternate branches become active across 6, 12, 24, and 36 months.
      </PageHeader>
      <section className="time-machine-layout">
        <div className="graph-stage">
          <div className="graph-toolbar">
            <button type="button" onClick={() => setZoom(Math.max(0.8, zoom - 0.1))}>
              -
            </button>
            <span>Zoom {Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom(Math.min(1.3, zoom + 0.1))}>
              +
            </button>
          </div>
          <CareerGraph route={route} month={month} zoom={zoom} />
          <label className="range-control">
            <span>Time horizon: {month} months</span>
            <input min="0" max="36" step="6" type="range" value={month} onChange={(event) => setMonth(Number(event.target.value))} />
          </label>
        </div>
        <aside className="work-panel">
          <h2>Selected route</h2>
          <RouteCard route={route} compact />
          <p className="disclaimer">{simulation.scenarioLabel}</p>
          <h3>Accessible timeline</h3>
          <ol className="timeline-list">
            {route.milestones.map((milestone) => (
              <li key={milestone.id} className={milestone.month <= month ? "active" : ""}>
                <strong>{milestone.month}M</strong>
                {milestone.title}
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </>
  );
}

function CareerGraph({ route, month, zoom }: { route: CareerRoute; month: number; zoom: number }) {
  const active = route.milestones.filter((milestone) => milestone.month <= month).length;
  return (
    <svg className="career-graph" viewBox="0 0 900 560" style={{ transform: `scale(${zoom})` }} role="img" aria-label="Branching career future graph">
      <path className="topo-line" d="M70 420 C210 350 310 440 470 375 S700 290 830 340" />
      <path className="topo-line muted" d="M60 470 C260 520 380 410 535 450 S730 500 845 430" />
      <path className="route-line primary" d="M430 295 C500 210 600 160 780 110" />
      <path className="route-line violet" d="M430 295 C545 295 650 290 810 250" />
      <path className="route-line amber" d="M430 295 C515 390 635 430 805 455" />
      <path className="route-line riskline" d="M430 295 C520 240 555 345 635 365" />
      <circle className="node present" cx="430" cy="295" r="28" />
      <text x="392" y="302">PRESENT</text>
      {route.milestones.map((milestone, index) => {
        const coords = [
          [535, 218],
          [640, 158],
          [780, 110]
        ][index] ?? [780, 110];
        return (
          <g key={milestone.id}>
            <circle className={index < active ? "node active" : "node"} cx={coords[0]} cy={coords[1]} r={18} />
            <text x={coords[0] - 42} y={coords[1] - 28}>
              {milestone.month}M
            </text>
            <text x={coords[0] - 56} y={coords[1] + 45}>
              {milestone.title.slice(0, 24)}
            </text>
          </g>
        );
      })}
      <circle className="node alt" cx="810" cy="250" r="19" />
      <text x="742" y="238">Alternate branch</text>
      <circle className="node risk" cx="805" cy="455" r="19" />
      <text x="721" y="488">Risk event</text>
      <circle className="node evidence" cx="635" cy="365" r="16" />
      <text x="573" y="397">Evidence node</text>
    </svg>
  );
}

function PathRacePage({ simulation }: AppPageProps) {
  const [weights, setWeights] = useState({ speed: 72, cost: 50, stability: 60, upside: 64, interest: 80, flexibility: 58 });
  const ranked = useMemo(() => {
    return [...simulation.routes].sort((a, b) => weightedRouteScore(b, weights) - weightedRouteScore(a, weights));
  }, [simulation.routes, weights]);
  const winner = ranked[0];

  return (
    <>
      <PageHeader eyebrow="Path Race" title="Path Race" icon={<Route size={42} />}>
        Compare competing futures as strategies with finish-line projections, bottlenecks, evidence strength, resilience, and failure modes.
      </PageHeader>
      <section className="race-layout">
        <div className="work-panel">
          <h2>Weights</h2>
          {Object.entries(weights).map(([key, value]) => (
            <label className="range-control" key={key}>
              <span>{titleCase(key)}: {value}</span>
              <input type="range" min="0" max="100" value={value} onChange={(event) => setWeights({ ...weights, [key]: Number(event.target.value) })} aria-label={titleCase(key)} />
            </label>
          ))}
        </div>
        <div className="race-track">
          {ranked.map((route, index) => (
            <article className="race-lane" key={route.id}>
              <span className="lane-rank">{index + 1}</span>
              <div>
                <h2>{route.title}</h2>
                <p>{route.bottleneck}</p>
              </div>
              <div className="finish-line" style={{ width: `${Math.max(30, weightedRouteScore(route, weights))}%` }}>
                <span>{route.uncertaintyBand.expectedMonths}M</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="two-column">
        <div className="work-panel">
          <h2>WHY THIS PATH WINS</h2>
          <p>{winner.title} currently wins because it best balances weighted readiness, constraint fit, and evidence production.</p>
          <ul>
            <li>Finish-line projection: {winner.uncertaintyBand.lowMonths}-{winner.uncertaintyBand.highMonths} months</li>
            <li>Evidence gain: {winner.score.evidenceCoverage}/100</li>
            <li>Fallback options: {winner.alternateRoutePoints.join(", ")}</li>
          </ul>
        </div>
        <div className="work-panel">
          <h2>WHAT COULD MAKE IT FAIL</h2>
          <ul>
            {winner.riskFactors.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function EvidencePage({ profile }: AppPageProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const parsed = repoUrl ? parseGitHubRepositoryUrl(repoUrl) : null;
  return (
    <>
      <PageHeader eyebrow="Evidence Graph" title="Evidence Graph" icon={<Radar size={42} />}>
        Claims are linked to evidence, skills, occupation requirements, and opportunities. Nothing is called verified unless a validation mechanism actually checked it.
      </PageHeader>
      <section className="two-column">
        <div className="graph-stage compact-stage">
          <EvidenceGraph profile={profile} />
        </div>
        <div className="work-panel">
          <label>
            GitHub repository URL
            <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="https://github.com/owner/repo" />
          </label>
          {repoUrl && (
            <p className={parsed ? "valid-message" : "error-message"}>
              {parsed ? `Supported public repository URL: ${parsed.normalizedUrl}` : "Use a public https://github.com/owner/repo URL only."}
            </p>
          )}
          <EvidenceList profile={profile} />
        </div>
      </section>
    </>
  );
}

function EvidenceGraph({ profile }: { profile: CareerProfile }) {
  return (
    <svg className="evidence-graph" viewBox="0 0 720 460" role="img" aria-label="Evidence graph from claims to skills to roles">
      <path className="route-line primary" d="M100 230 C220 90 380 90 540 160" />
      <path className="route-line violet" d="M100 230 C230 235 390 250 555 245" />
      <path className="route-line amber" d="M100 230 C235 360 400 370 565 330" />
      <GraphNode x={100} y={230} label="User claim" kind="claim" />
      <GraphNode x={300} y={100} label="Evidence" kind="evidence" />
      <GraphNode x={330} y={250} label="Skill" kind="skill" />
      <GraphNode x={560} y={160} label="Occupation requirement" kind="role" />
      <GraphNode x={565} y={330} label="Career opportunity" kind="opportunity" />
      <text x="60" y="420">{profile.evidence.length} evidence items loaded for {profile.name}</text>
    </svg>
  );
}

function GraphNode({ x, y, label, kind }: { x: number; y: number; label: string; kind: string }) {
  return (
    <g>
      <circle className={`node ${kind}`} cx={x} cy={y} r="22" />
      <text x={x - 58} y={y + 42}>{label}</text>
    </g>
  );
}

function MissionsPage({ mission }: AppPageProps) {
  const [copied, setCopied] = useState(false);
  async function copyBrief() {
    await navigator.clipboard?.writeText(mission.codexBrief);
    setCopied(true);
  }

  return (
    <>
      <PageHeader eyebrow="Missions" title="Proof Missions" icon={<Target size={42} />}>
        Convert target gaps into inspectable evidence with deliverables, acceptance criteria, rubrics, and a Codex build brief.
      </PageHeader>
      <section className="mission-layout">
        <article className="mission-brief">
          <span className="eyebrow">Target gap: {mission.targetGap}</span>
          <h2>{mission.title}</h2>
          <p>{mission.whyThisMatters}</p>
          <div className="mission-meta">
            <span>{mission.estimatedHours}</span>
            <span>{mission.difficulty}</span>
            <span>{mission.targetSkills.map((skill) => skillLabels[skill]).join(", ")}</span>
          </div>
          <h3>Deliverables</h3>
          <ul>
            {mission.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Evaluation rubric</h3>
          <ul>
            {mission.rubric.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <aside className="work-panel">
          <h2>Codex build brief</h2>
          <pre>{mission.codexBrief}</pre>
          <button className="primary-action" type="button" onClick={copyBrief}>
            <Clipboard size={16} aria-hidden="true" />
            {copied ? "Copied" : "Copy Codex build brief"}
          </button>
        </aside>
      </section>
    </>
  );
}

function FutureSelfPage({ topRoute, mission }: AppPageProps) {
  const [messages, setMessages] = useState<string[]>([
    `Future Me, 12 months ahead on the ${topRoute.title}, is grounded in the selected path, milestones, assumptions, and proof missions.`
  ]);
  const prompts = ["What should I do this week?", "What did I waste time on?", "Which project changed everything?"];

  function ask(prompt: string) {
    const response =
      prompt === "What should I do this week?"
        ? `This week, complete the first slice of ${mission.title.toLowerCase()}: create the repository, define the health endpoint, and write the acceptance checklist before coding.`
        : prompt === "What did I waste time on?"
          ? "The biggest waste was collecting generic certificates before turning one credible project into inspectable deployment evidence."
          : `The project that changed everything was ${mission.title.toLowerCase()} because it made the route visible instead of merely claimed.`;
    setMessages([...messages, `You: ${prompt}`, `Future Me: ${response}`]);
  }

  function speakLast() {
    const last = messages[messages.length - 1];
    if ("speechSynthesis" in window && last) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(last));
    }
  }

  return (
    <>
      <PageHeader eyebrow="Future Self" title="Future Self Encounter" icon={<Brain size={42} />}>
        A reflective simulation, not an actual prediction. The future self can only reference the selected path, milestones, decisions, evidence, and assumptions.
      </PageHeader>
      <section className="future-room">
        <div className="current-side">
          <span>Current user</span>
          <h2>Questions at the boundary</h2>
          <div className="prompt-row">
            {prompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => ask(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
        <div className="future-side">
          <span>Possible future self</span>
          <div className="chat-log" aria-live="polite">
            {messages.map((message, index) => (
              <p key={`${message}-${index}`}>{message}</p>
            ))}
          </div>
          <button className="secondary-action" type="button" onClick={speakLast}>
            Listen
          </button>
        </div>
      </section>
    </>
  );
}

function DecisionsPage({ decisions, setDecisions }: AppPageProps) {
  const [form, setForm] = useState({ decision: "", expectation: "", successSignal: "", timeHorizonDays: 90 });

  function saveDecision(event: FormEvent) {
    event.preventDefault();
    setDecisions([
      ...decisions,
      {
        id: crypto.randomUUID(),
        decision: form.decision,
        expectation: form.expectation,
        successSignal: form.successSignal,
        timeHorizonDays: form.timeHorizonDays,
        reviewDate: new Date(Date.now() + form.timeHorizonDays * 86400000).toISOString().slice(0, 10)
      }
    ]);
    setForm({ decision: "", expectation: "", successSignal: "", timeHorizonDays: 90 });
  }

  return (
    <>
      <PageHeader eyebrow="Decision Journal" title="Decision Journal" icon={<BookOpen size={42} />}>
        Record expectations before acting, then compare expected outcomes against actual outcomes to update future recommendations.
      </PageHeader>
      <section className="two-column">
        <form className="work-panel" onSubmit={saveDecision}>
          <label>
            Decision
            <input value={form.decision} onChange={(event) => setForm({ ...form, decision: event.target.value })} required />
          </label>
          <label>
            Expectation
            <input value={form.expectation} onChange={(event) => setForm({ ...form, expectation: event.target.value })} required />
          </label>
          <label>
            Success signal
            <input value={form.successSignal} onChange={(event) => setForm({ ...form, successSignal: event.target.value })} required />
          </label>
          <label>
            Time horizon
            <input
              type="number"
              min="14"
              max="365"
              value={form.timeHorizonDays}
              onChange={(event) => setForm({ ...form, timeHorizonDays: Number(event.target.value) })}
            />
          </label>
          <button className="primary-action" type="submit">
            Save decision
          </button>
        </form>
        <div className="work-panel">
          <h2>Recorded decisions</h2>
          {decisions.length ? (
            decisions.map((decision) => (
              <article className="decision-item" key={decision.id}>
                <h3>{decision.decision}</h3>
                <p>Expected: {decision.expectation}</p>
                <p>Success signal: {decision.successSignal}</p>
                <span>Review: {decision.reviewDate}</span>
              </article>
            ))
          ) : (
            <p>No decisions saved yet.</p>
          )}
        </div>
      </section>
    </>
  );
}

function ProfilePage({ profile, setProfile, constraints, setConstraints }: AppPageProps) {
  const profileJson = JSON.stringify({ profile, constraints }, null, 2);
  return (
    <>
      <PageHeader eyebrow="Profile" title="Twin Profile" icon={<UserRound size={42} />}>
        Guest mode keeps the demo usable without signup. Career claims are labeled as self-reported, supported, or strong evidence.
      </PageHeader>
      <section className="two-column">
        <div className="work-panel">
          <h2>{profile.name}</h2>
          <p>{profile.fictional ? "Fictional demo data." : "User profile."}</p>
          <label>
            Target timeline
            <input
              type="number"
              min="6"
              max="36"
              value={constraints.desiredTimelineMonths}
              onChange={(event) => setConstraints({ ...constraints, desiredTimelineMonths: Number(event.target.value) })}
            />
          </label>
          <button className="secondary-action" type="button" onClick={() => downloadText("careertwin-profile.json", profileJson)}>
            <Download size={16} aria-hidden="true" />
            Export data
          </button>
          <button className="danger-action" type="button" onClick={() => setProfile(demoProfile)}>
            <Trash2 size={16} aria-hidden="true" />
            Delete profile and reload demo
          </button>
        </div>
        <div className="work-panel">
          <h2>Skills</h2>
          <div className="skill-cloud">
            {Object.entries(profile.skills).map(([skill, value]) => (
              <span key={skill}>
                {skillLabels[skill as SkillId]} <strong>{value}</strong>
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ReplayPage({ decisions, simulation }: AppPageProps) {
  const events = [
    "Demo Twin loaded",
    "Career simulation generated",
    `${simulation.routes.length} route strategies ranked`,
    ...decisions.map((decision) => `Decision recorded: ${decision.decision}`)
  ];
  return (
    <>
      <PageHeader eyebrow="Career Replay" title="Career Replay" icon={<Activity size={42} />}>
        Replay profile changes, decisions, missions, evidence, simulation changes, goal changes, and outcomes to understand why recommendations changed.
      </PageHeader>
      <ol className="replay-list">
        {events.map((event, index) => (
          <li key={`${event}-${index}`}>
            <span>{index + 1}</span>
            {event}
          </li>
        ))}
      </ol>
    </>
  );
}

function EvidenceList({ profile }: { profile: CareerProfile }) {
  return (
    <div className="evidence-list">
      {profile.evidence.map((item) => (
        <article key={item.id}>
          <span>{classifyEvidence(item)}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  );
}

function weightedRouteScore(route: CareerRoute, weights: Record<string, number>) {
  return Math.round(
    route.score.timeFeasibility * (weights.speed / 500) +
      route.score.costFeasibility * (weights.cost / 500) +
      (100 - route.score.riskPenalty) * (weights.stability / 500) +
      roleCatalog[route.targetRole].upsideSignal * (weights.upside / 500) +
      route.score.alignmentScore * (weights.interest / 500) +
      route.score.optionality * (weights.flexibility / 500)
  );
}

function parseResumeFacts(text: string) {
  const lower = text.toLowerCase();
  const facts: string[] = [];
  if (lower.includes("python")) facts.push("Python experience");
  if (lower.includes("aws") || lower.includes("cloud")) facts.push("Cloud exposure");
  if (lower.includes("support")) facts.push("Customer-facing support work");
  if (lower.includes("automation")) facts.push("Automation experiments");
  if (lower.includes("project") || lower.includes("github")) facts.push("Project or repository evidence");
  return facts;
}

function titleCase(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default App;
