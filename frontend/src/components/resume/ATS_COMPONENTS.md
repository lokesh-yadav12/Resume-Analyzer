# ATS Visualization Components

This directory contains comprehensive React components for visualizing ATS (Applicant Tracking System) compatibility scores and analysis results.

## Components Overview

### 1. ATSCircularGauge
A customizable circular progress gauge for displaying ATS scores.

**Features:**
- Multiple sizes (sm, md, lg, xl)
- Animated progress with smooth transitions
- Color-coded based on score ranges
- Optional grade display and labels
- Gradient effects and visual enhancements

**Usage:**
```jsx
import { ATSCircularGauge } from './components/resume';

<ATSCircularGauge 
  score={78.5} 
  size="lg" 
  showLabel={true} 
  showGrade={true}
  animated={true}
/>
```

### 2. ATSGradeIndicator
Color-coded grade indicators with descriptions and recommendations.

**Features:**
- Grade-based color coding (A+ to D)
- Customizable sizes
- Optional descriptions and recommendations
- Includes ATSGradeLegend component for reference

**Usage:**
```jsx
import { ATSGradeIndicator, ATSGradeLegend } from './components/resume';

<ATSGradeIndicator 
  grade="B" 
  score={78.5}
  size="md"
  showDescription={true}
  showRecommendations={true}
/>

<ATSGradeLegend />
```

### 3. ATSBreakdownCards
Detailed breakdown cards showing individual scoring categories with improvement tips.

**Features:**
- Expandable cards for each scoring category
- Progress bars with animations
- Detailed improvement tips and score ranges
- Priority-based suggestions
- Interactive expand/collapse functionality

**Usage:**
```jsx
import { ATSBreakdownCards } from './components/resume';

<ATSBreakdownCards 
  breakdown={{
    keywordMatch: 32.5,
    contactInfo: 15,
    structure: 18,
    formatting: 13,
    quantifiable: 8
  }}
  suggestions={['Add more keywords', 'Improve formatting']}
/>
```

### 4. ATSComparison
Before/after comparison component for tracking improvements over time.

**Features:**
- Side-by-side score comparison
- Improvement percentage calculations
- Detailed breakdown comparisons
- Visual progress indicators
- Overview and detailed view modes

**Usage:**
```jsx
import { ATSComparison } from './components/resume';

<ATSComparison 
  beforeData={{
    totalScore: 65.2,
    grade: 'C',
    breakdown: { /* ... */ },
    date: '2024-01-01'
  }}
  afterData={{
    totalScore: 78.5,
    grade: 'B',
    breakdown: { /* ... */ },
    date: '2024-01-08'
  }}
  onRefresh={handleRefresh}
/>
```

### 5. ATSScoreCard (Enhanced)
The main ATS score display card with comprehensive information.

**Features:**
- Circular progress gauge
- Score breakdown with progress bars
- Improvement suggestions
- Grade indicators
- Animated transitions

### 6. ATSDashboard
Comprehensive dashboard combining all ATS visualization components.

**Features:**
- Tabbed interface (Overview, Detailed Analysis, Comparison)
- Integrated legend toggle
- Action buttons (refresh, download, share)
- Responsive layout
- Loading states and error handling

**Usage:**
```jsx
import { ATSDashboard } from './components/resume';

<ATSDashboard
  resumeData={resumeData}
  comparisonData={comparisonData}
  onRefresh={handleRefresh}
  onDownloadReport={handleDownloadReport}
  onShareResults={handleShareResults}
/>
```

### 7. ATSAnalysisPage
Complete page component demonstrating integration of all ATS components.

**Features:**
- File upload integration
- Loading states
- Error handling
- Sample data for demonstration
- Complete user flow

## Data Structure

### ATS Score Data Format
```javascript
const atsScoreData = {
  totalScore: 78.5,           // 0-100
  breakdown: {
    keywordMatch: 32.5,       // 0-40 points
    contactInfo: 15,          // 0-15 points
    structure: 18,            // 0-20 points
    formatting: 13,           // 0-15 points
    quantifiable: 8           // 0-10 points
  },
  grade: 'B',                 // A+, A, B, C, D
  suggestions: [              // Array of improvement suggestions
    'Add more quantifiable achievements',
    'Include relevant keywords'
  ]
};
```

### Resume Data Format
```javascript
const resumeData = {
  id: 'resume-123',
  fileName: 'resume.pdf',
  atsScore: atsScoreData,
  analyzedAt: '2024-01-15T10:30:00Z'
};
```

### Comparison Data Format
```javascript
const comparisonData = {
  before: {
    totalScore: 65.2,
    grade: 'C',
    breakdown: { /* ... */ },
    date: '2024-01-01T00:00:00Z'
  },
  after: {
    totalScore: 78.5,
    grade: 'B',
    breakdown: { /* ... */ },
    date: '2024-01-08T00:00:00Z'
  }
};
```

## Styling and Theming

### Color Scheme
- **A+ Grade**: Green (#22c55e)
- **A Grade**: Green (#16a34a)
- **B Grade**: Yellow (#eab308)
- **C Grade**: Orange (#f59e0b)
- **D Grade**: Red (#ef4444)

### Responsive Design
All components are built with responsive design principles:
- Mobile-first approach
- Flexible grid layouts
- Adaptive font sizes
- Touch-friendly interactions

### Animations
Components use Framer Motion for smooth animations:
- Entrance animations with staggered delays
- Progress bar animations
- Hover and interaction effects
- Loading state animations

## Integration with Backend API

### API Endpoints
The components are designed to work with these API endpoints:

```javascript
// Calculate ATS score
POST /api/ats/calculate/:resumeId
POST /api/ats/calculate-text

// Get suggestions
GET /api/ats/suggestions/:resumeId

// Compare scores
POST /api/ats/compare

// Get history
GET /api/ats/history

// Get grade info
GET /api/ats/grade-info
```

### Error Handling
Components include comprehensive error handling:
- Network error states
- Loading indicators
- Fallback UI for missing data
- User-friendly error messages

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: WCAG compliant color combinations
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Proper heading hierarchy and structure

## Performance Optimizations

- **Lazy Loading**: Components load only when needed
- **Memoization**: React.memo for expensive calculations
- **Efficient Animations**: Hardware-accelerated CSS transforms
- **Bundle Splitting**: Separate chunks for better loading

## Testing

### Unit Tests
```bash
npm test -- --testPathPattern=ATS
```

### Integration Tests
```bash
npm run test:integration
```

### Visual Regression Tests
```bash
npm run test:visual
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- Framer Motion 10+
- Lucide React (icons)
- Tailwind CSS 3+

## Contributing

When adding new ATS visualization features:

1. Follow the existing component structure
2. Include proper TypeScript types
3. Add comprehensive documentation
4. Include unit tests
5. Ensure accessibility compliance
6. Test on multiple screen sizes

## Examples

See `ATSAnalysisPage.jsx` for a complete implementation example showing how to integrate all components together with proper data flow and error handling.