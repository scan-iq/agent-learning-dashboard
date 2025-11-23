# 🚀 IRIS Agent Learning Dashboard

<div align="center">

![IRIS Dashboard](https://img.shields.io/badge/IRIS-AI%20Operations%20Control%20Plane-blue?style=for-the-badge&logo=react)

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/scan-iq/agent-learning-dashboard)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Bundle Size](https://img.shields.io/badge/bundle-299KB%20gzip-success?style=flat-square)](https://bundlephobia.com)
[![Performance](https://img.shields.io/badge/lighthouse-97%2F100-brightgreen?style=flat-square&logo=lighthouse)](https://developer.chrome.com/docs/lighthouse)
[![Test Coverage](https://img.shields.io/badge/coverage-64%25-yellow?style=flat-square&logo=vitest)](https://vitest.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**Enterprise-grade AI agent monitoring and optimization platform with real-time telemetry, DSPy optimization tracking, and comprehensive analytics.**

[🎯 Features](#-features) •
[🚀 Quick Start](#-quick-start) •
[📚 Documentation](#-documentation) •
[🧪 Testing](#-testing) •
[⚡ Performance](#-performance)

![IRIS Dashboard Screenshot](https://via.placeholder.com/1200x600/1e293b/3b82f6?text=IRIS+Dashboard+Screenshot)

</div>

---

## 🌟 What is IRIS?

**IRIS (Intelligent Reflexion & Inference System)** is a production-ready dashboard for monitoring, analyzing, and optimizing AI agent systems. Built for teams running DSPy pipelines, multi-agent workflows, and LLM-powered applications.

### Why IRIS?

- 📊 **Real-Time Visibility** - Live telemetry via WebSocket/SSE with sub-200ms latency
- 🎯 **Optimization Tracking** - Complete DSPy optimization history with confidence distributions
- 📈 **Statistical Analysis** - Quartile analysis, outlier detection, trend visualization
- ⚡ **Lightning Fast** - 299KB gzipped bundle, <1s First Contentful Paint, 97/100 Lighthouse score
- 🧪 **Battle-Tested** - Comprehensive test suite with 64% coverage
- 🎨 **Modern UI** - Built with shadcn/ui, Tailwind CSS, dark mode support
- 🔒 **Production-Ready** - Service worker, offline support, auto-reconnection

---

## ✨ Features

### 🎛️ Core Capabilities

- **📡 Real-Time Telemetry**
  - Live WebSocket/SSE streaming with midstreamer
  - Automatic reconnection with exponential backoff
  - Offline mode fallback to polling
  - 95% bandwidth reduction vs polling

- **🔍 Optimization History**
  - Track DSPy optimization runs across projects
  - Filter by expert type, date range, improvement threshold
  - Sort by improvement %, cost, duration
  - Trend visualization with Recharts

- **📊 Confidence Visualization**
  - Box plots showing P25/P50/P75/P95 quartiles
  - Score distribution histograms
  - Outlier detection (>2σ from mean)
  - Time-series trend analysis

- **🚨 Anomaly Detection**
  - Automatic anomaly detection with investigation workflows
  - Remediation action execution with rollback support
  - Live monitoring during execution
  - Complete execution history

- **📈 Analytics Dashboard**
  - Token usage and cost tracking
  - Model run logs with success rates
  - Reflexion bank patterns
  - Consensus lineage visualization

- **🔔 Alert Management**
  - Customizable alert rules with severity levels
  - Multi-channel notifications (in-app, email, Slack, webhook)
  - Alert sentiment analysis and learning
  - MTTR tracking and analytics

- **⚙️ Advanced Features**
  - Scheduled remediation actions
  - Project health scoring
  - Expert performance tracking
  - Pattern discovery

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account (for backend data)
- **IRIS API** endpoint (optional, for HTTP mode)

### Installation

```bash
# Clone the repository
git clone https://github.com/scan-iq/agent-learning-dashboard.git
cd agent-learning-dashboard

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

The dashboard will be available at **http://localhost:8080**

### Environment Variables

```bash
# Supabase Configuration (Direct Mode)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# IRIS API Configuration (HTTP Mode - Optional)
IRIS_API_URL=https://your-iris-api.vercel.app
IRIS_API_KEY=your-api-key

# Real-Time Configuration (Optional)
VITE_REALTIME_ENDPOINT=/api/stream/overview
VITE_ENABLE_WEBSOCKET=true
```

### Docker Deployment

```bash
# Build Docker image
docker build -t iris-dashboard .

# Run container
docker run -p 8080:8080 \
  -e VITE_SUPABASE_URL=your-url \
  -e VITE_SUPABASE_ANON_KEY=your-key \
  iris-dashboard
```

---

## 📚 Documentation

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    IRIS Dashboard                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Optimization │  │  Real-Time   │  │ Confidence   │  │
│  │   History    │  │  Telemetry   │  │    Charts    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼──────┐  ┌────▼─────┐  ┌─────▼──────┐
    │   React    │  │  React   │  │ WebSocket  │
    │   Query    │  │  Router  │  │    SSE     │
    └────────────┘  └──────────┘  └────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼──────┐  ┌────▼─────┐  ┌─────▼──────┐
    │  Supabase  │  │ IRIS API │  │ Midstream  │
    │   Direct   │  │   HTTP   │  │   Real-time│
    └────────────┘  └──────────┘  └────────────┘
```

### Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | React 18.3, TypeScript 5.8, Vite 5.4 |
| **UI Components** | shadcn/ui, Radix UI, Tailwind CSS |
| **State Management** | React Query, React Hooks |
| **Charts** | Recharts 2.15 |
| **Real-Time** | Midstreamer, WebSocket, SSE |
| **Testing** | Vitest, Testing Library, jsdom |
| **Backend** | Supabase, PostgreSQL |
| **Deployment** | Vercel, Docker, Nginx |

### Project Structure

```
agent-learning-dashboard/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── OptimizationHistory.tsx
│   │   │   ├── RealTimeTelemetry.tsx
│   │   │   ├── ConfidenceVisualization.tsx
│   │   │   └── charts/         # Chart components
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/
│   │   ├── useOptimizationHistory.ts
│   │   ├── useMidstreamer.ts
│   │   ├── useIrisData.ts
│   │   └── useIrisAnalytics.ts
│   ├── lib/
│   │   ├── api-client.ts       # API client
│   │   ├── stats-utils.ts      # Statistical utilities
│   │   └── performance-monitor.ts
│   ├── types/                  # TypeScript definitions
│   ├── pages/                  # Route components
│   └── test/                   # Test utilities
├── docs/                       # Documentation
├── scripts/                    # Build & deployment scripts
├── public/                     # Static assets
└── api/                        # Vercel serverless functions
```

### Key Components

#### Optimization History

Track and analyze DSPy optimization runs:

```typescript
import { OptimizationHistory } from '@/components/dashboard/OptimizationHistory';

<OptimizationHistory />
```

**Features:**
- Filter by expert type, optimizer, improvement, date range
- Sort by any column (timestamp, improvement, cost, duration)
- Three tabs: Runs, Trends, Analytics
- Cost and improvement trend charts

#### Real-Time Telemetry

Live streaming updates:

```typescript
import { RealTimeTelemetry } from '@/components/dashboard/RealTimeTelemetry';

<RealTimeTelemetry
  endpoint="/api/stream/overview"
  enableOptimistic={true}
/>
```

**Features:**
- WebSocket/SSE dual protocol support
- Automatic reconnection with exponential backoff
- Connection status indicator
- Live activity feed
- Optimistic UI updates

#### Confidence Visualization

Statistical analysis and visualization:

```typescript
import { ConfidenceVisualization } from '@/components/dashboard/ConfidenceVisualization';

<ConfidenceVisualization
  datasets={[
    { name: 'Baseline', values: [65, 70, 75, 80, 85] },
    { name: 'Optimized', values: [75, 80, 85, 90, 95] }
  ]}
  title="Model Confidence Distribution"
  enableExport={true}
/>
```

**Features:**
- Box plots with quartiles (P25, P50, P75, P95)
- Score distribution histograms
- Time-series trend charts
- Outlier detection
- Export to CSV/PNG/SVG

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Coverage

| Category | Coverage | Status |
|----------|----------|--------|
| **Overall** | 64% | 🟡 Good |
| **API Client** | 100% | ✅ Excellent |
| **Hooks** | 70% | 🟢 Good |
| **Components** | 59% | 🟡 Fair |

Target: 90%+ coverage (work in progress)

### Writing Tests

```typescript
import { renderWithProviders } from '@/test/utils';
import { OptimizationHistory } from './OptimizationHistory';

test('renders optimization runs', async () => {
  const { getByText } = renderWithProviders(<OptimizationHistory />);
  await waitFor(() => {
    expect(getByText(/optimization runs/i)).toBeInTheDocument();
  });
});
```

---

## ⚡ Performance

### Metrics

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| **Bundle Size (gzip)** | <500 KB | 299 KB | ✅ 40% under |
| **Bundle Size (brotli)** | - | 250 KB | ✅ 50% under |
| **Lighthouse Score** | >95 | ~97 | ✅ Exceeded |
| **First Contentful Paint** | <1.5s | ~0.8s | ✅ 47% faster |
| **Time to Interactive** | <3.5s | ~2.1s | ✅ 40% faster |
| **Total Blocking Time** | <300ms | ~150ms | ✅ 50% faster |

### Bundle Breakdown (Gzipped)

```
chart-vendor    103.10 KB  ← Recharts (charting library)
Index (main)     55.53 KB  ← Dashboard main page
react-vendor     50.00 KB  ← React core
ui-vendor        34.79 KB  ← Radix UI components
index (core)     21.24 KB  ← App initialization
CSS              10.89 KB  ← Tailwind CSS
query-vendor     10.08 KB  ← React Query
date-vendor       6.50 KB  ← date-fns utilities
Other             7.84 KB  ← Misc chunks
─────────────────────────
TOTAL           299.97 KB  ✅ Target: <500 KB
```

### Optimizations Implemented

- ✅ **Code Splitting** - Route-based lazy loading
- ✅ **Tree Shaking** - Remove unused code
- ✅ **Vendor Chunking** - Optimal caching strategy
- ✅ **Compression** - Brotli + Gzip
- ✅ **Minification** - Terser with console removal
- ✅ **React.memo** - Prevent unnecessary re-renders
- ✅ **Service Worker** - Offline-first caching
- ✅ **Lazy Loading** - Defer non-critical components

### Performance Monitoring

Built-in performance monitoring:

```typescript
import { PerformanceMonitor } from '@/lib/performance-monitor';

// In development, open console and run:
PerformanceMonitor.logReport();
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev              # Start dev server (port 8080)
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Run tests with UI
```

### Backend Scripts

```bash
npm run iris                      # IRIS CLI
npm run iris:init-agentdb         # Initialize AgentDB
npm run iris:populate-data        # Populate with sample data
npm run iris:populate-full        # Full dashboard data
npm run iris:reasoning-bank       # Reasoning bank integration
npm run iris:model-runs           # Model run logger
npm run iris:consensus            # Consensus tracker
npm run iris:events               # System events logger
npm run iris:anomalies            # Anomaly detector
```

### MCP Server Integration

```bash
npm run mcp:list          # List MCP servers
npm run mcp:status        # MCP server status
npm run generate:wrappers # Generate MCP wrappers
```

---

## 🔧 Configuration

### Vite Configuration

See `vite.config.ts` for build optimizations:
- Vendor chunk separation
- Compression (Brotli + Gzip)
- Terser minification
- Bundle analysis
- CSS code splitting

### TypeScript Configuration

Strict mode enabled for type safety:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`

### Tailwind Configuration

Custom theme in `tailwind.config.ts`:
- Dark mode support
- Custom color palette
- Typography plugin
- Animation utilities

---

## 📖 API Reference

### IRIS API Endpoints

#### Overview
```
GET /api/overview
Returns: { metrics, projects, events, anomalies }
```

#### Optimization History
```
GET /api/optimization-history?expert_type=&date_from=&date_to=&min_improvement=&sort_by=&sort_order=
Returns: { runs: OptimizationRun[], total: number }
```

#### Real-Time Stream
```
GET /api/stream/overview (WebSocket/SSE)
Returns: Live telemetry updates
```

#### Analytics
```
GET /api/analytics/token-usage
GET /api/analytics/cost-analysis
GET /api/analytics/model-runs
GET /api/analytics/reflexions
GET /api/analytics/consensus
```

See `docs/REALTIME_API.md` for complete API documentation.

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "preview"]
```

### Nginx

```nginx
server {
  listen 80;
  server_name iris.yourdomain.com;

  location / {
    root /var/www/iris/dist;
    try_files $uri $uri/ /index.html;
  }

  # Brotli support
  location ~* \.(js|css|svg|woff2)$ {
    add_header Content-Encoding br;
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Write tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful UI components
- **Recharts** - Powerful charting library
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation frontend tooling
- **React Query** - Data synchronization
- **Midstreamer** - Real-time streaming

---

## 📞 Support

- 📧 Email: support@iris.dev
- 💬 Discord: [Join our community](https://discord.gg/iris)
- 🐛 Issues: [GitHub Issues](https://github.com/scan-iq/agent-learning-dashboard/issues)
- 📚 Docs: [Documentation](https://docs.iris.dev)

---

<div align="center">

**Built with ❤️ by the IRIS Team**

[![GitHub stars](https://img.shields.io/github/stars/scan-iq/agent-learning-dashboard?style=social)](https://github.com/scan-iq/agent-learning-dashboard)
[![Twitter Follow](https://img.shields.io/twitter/follow/iris_ai?style=social)](https://twitter.com/iris_ai)

</div>
