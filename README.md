# AthleteXchange (ATHLX) - Pilot Program

**A closed pilot platform exploring new athlete support models through a demo-only test environment**

🌐 **Live Demo**: https://3000-ip0f0nc2ffi4klmmd4lil-cc2fbc16.sandbox.novita.ai

---

## ⚠️ IMPORTANT DISCLAIMER

**This is a pilot program for UX testing only.**

- Uses **Demo Credits (tATHLX)** with no real-world value
- **Not an investment product**, not a securities offering, not a financial service
- No withdrawals, no external transfers, no real money involved
- Athlete Units are demo-only and represent no ownership rights
- Closed test environment for community participation and feedback

---

## 📋 Project Overview

AthleteXchange (ATHLX) is a fully functional demo web application that explores new models for athlete support. This pilot uses Demo Credits and Athlete Units purely for testing user experience and support allocation logic.

### Core Concept

> "Testing community-driven athlete support models in a safe, demo-only environment."

This pilot explores:
- Direct support models for athletes during early career stages
- Simulated post-career support mechanisms (Post-Career Support Vault)
- Community participation in athlete support allocation
- UX testing for new platform features and workflows

---

## ✨ Key Features

### 🏠 Landing Page
- Clear pilot program messaging with disclaimers
- "How It Works" 4-step flow
- Purpose explanation sections
- Newly listed and fast-growing athlete showcases

### 🏪 Athlete Directory (Test Environment)
- **20 diverse athletes** across Olympic sports
- **Categories**: Amateur, Semi-pro, Pro, Elite
- Advanced filtering by sport, category, nationality
- Segments: New Athletes, Featured, Category Promotions, Fast Growing
- Activity index display with 24h/7d changes
- Mini activity charts
- Activity volume and participant counts

### 👤 Athlete Detail Pages
- Comprehensive profile with bio and statistics
- **Activity chart** with multiple timeframes (1D/1W/1M)
- Embedded YouTube highlight videos
- Related news articles
- Acquire/Release units interface with demo fee breakdown
- Real-time demo balance updates

### 💱 Demo Activity System
- **5% demo fee** on all simulated transactions
  - **3% Operations Wallet** (platform simulation)
  - **1% Athlete Reward Wallet** (demo allocation)
  - **1% Post-Career Support Vault** (locked demo ledger)
- Acquire/Release modal with clear calculations
- Instant demo portfolio updates
- Activity history tracking
- Simulated session ID (replaces MetaMask display)

### 👥 User Features

#### Fan Page
- Demo portfolio overview with tATHLX balance
- Holdings table with activity tracking
- Activity history with detailed log
- Participation metrics

#### Athlete Page
- Activity statistics (index, participants, volume)
- **Real-time support allocation tracking**
- Demo reward accumulation display
- Link to public athlete profile

### 📝 Athlete Registration
- Multi-step registration form
- Sport selection across all Olympic sports
- Category request (Amateur to Elite)
- Bio and profile information
- Submission for admin approval

### 🔐 Admin Panel
- **PIN protected** (configurable via NEXT_PUBLIC_ADMIN_PIN environment variable)
- Dashboard with summary statistics
- Pending applications queue
- Detailed application review
- Approve/reject with customizable parameters
- Set initial activity index and symbol
- Automatic directory listing upon approval

### 📰 Sports News
- Curated news feed with athlete connections
- Filter by sport and category
- Related athlete cards
- External article links

### ℹ️ About Page
- **Compliance-first content** (fully rewritten)
- Pilot program explanation
- Demo-only disclaimers
- Support allocation model description
- Post-Career Support Vault details
- No investment/securities language

---

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Chart.js with react-chartjs-2

### State Management
- React Context API
- LocalStorage persistence
- Real-time UI updates

### Key Libraries
- Next.js 14.2.33
- React 18
- TypeScript 5
- Tailwind CSS 3
- Chart.js 4
- Lucide React (icons)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd webapp

# Install dependencies
npm install

# Set up environment variables (optional)
# Create .env.local and add:
# NEXT_PUBLIC_ADMIN_PIN=your_secure_pin

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

- `NEXT_PUBLIC_ADMIN_PIN`: Admin panel PIN (defaults to "1234" if not set)

### Environment
The application runs on `http://localhost:3000` by default.

---

## 📱 Application Structure

```
webapp/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Home page (updated with safe copy)
│   ├── layout.tsx           # Root layout with navigation
│   ├── market/              # Test Environment / Athlete Directory
│   ├── athlete/[symbol]/    # Dynamic athlete detail pages
│   ├── about/               # About page (fully rewritten)
│   ├── news/                # Sports news page
│   ├── my-page/             # User dashboard (Fan + Athlete views)
│   ├── register-athlete/    # Athlete registration form
│   └── admin/               # Admin panel (PIN protected)
├── components/              # Reusable React components
│   ├── Navigation.tsx       # Top nav with global disclaimer banner
│   ├── Footer.tsx           # Footer with admin link
│   ├── AuthModal.tsx        # Login/Signup modal
│   ├── TradeModal.tsx       # Acquire/Release units interface
│   └── AdminPasswordModal.tsx # Admin PIN entry (env-based)
├── lib/                     # Core application logic
│   ├── types.ts             # TypeScript type definitions
│   ├── data.ts              # Initial athlete and news data
│   ├── store.tsx            # React Context state management
│   └── translations.ts      # EN/ES language support (updated)
└── public/                  # Static assets
```

---

## 🎯 User Flows

### Participant/Fan Flow
1. Browse Athlete Directory and filter athletes
2. Login/Sign up
3. View demo session ID (simulated)
4. View athlete details and activity charts
5. Acquire units (5% demo fee applied)
6. Monitor demo portfolio in My Page (Fan tab)
7. View activity history
8. Release units
9. Track participation metrics

### Athlete Flow
1. Browse platform as fan
2. Register as athlete with comprehensive form
3. Submit application (requires login)
4. Wait for admin approval
5. Upon approval, view stats in My Page (Athlete tab)
6. Monitor activity volume
7. See demo allocation accumulation
8. Track participant growth

### Admin Flow
1. Access footer "Admin Panel" link
2. Enter PIN (configurable via NEXT_PUBLIC_ADMIN_PIN)
3. Review dashboard statistics
4. Navigate to pending applications
5. Review application details
6. Set final category, initial index, symbol
7. Approve → athlete listed in directory
8. OR Reject with reason

---

## 💾 Data Persistence

All data is stored in browser **localStorage**:
- User accounts (email/password)
- Current user session
- Athletes (initial 20 + approved registrations)
- Activity history
- Demo portfolio holdings
- Pending athlete applications
- News articles

**Reset**: Clear browser localStorage to reset all data.

---

## 🎨 Design Features

### Visual Style
- **Dark futuristic theme** with blue/purple gradients
- **Glass-morphism effects** for modern card UI
- **High contrast numbers** - all values clearly visible
- Custom display fonts with shadows
- Smooth hover animations and transitions
- Responsive design for mobile, tablet, desktop
- **Global disclaimer banner** (sticky at top, all pages)

### Color Coding
- **Green**: Positive changes, acquire actions
- **Red**: Negative changes, release actions
- **Blue**: Primary actions, platform branding
- **Purple**: Athlete-specific actions
- **Orange**: Demo session ID

### Category Badges
- **Amateur**: Gray
- **Semi-pro**: Blue
- **Pro**: Purple
- **Elite**: Gold

### Tag Badges
- **New**: Green
- **Featured**: Orange
- **Promoted**: Pink
- **Fast Growing**: Red

---

## 🌍 Internationalization

- **Language Toggle**: EN / ES in navigation (persistent)
- Full translations for all UI elements
- Compliance-safe terminology in both languages
- Easy to extend to additional languages

---

## 📊 Demo Data

### Athletes (20)
Diverse representation across:
- 15+ different sports
- 12+ nationalities
- All 4 categories (Amateur, Semi-pro, Pro, Elite)
- Activity index range: 85 - 850 pts
- Various tags and segments

### News (12 articles)
- Coverage across multiple sports
- Related to specific athletes
- Recent dates
- Mix of performance, career news

### Default User Balance
- 10,000 tATHLX (demo credits) upon login
- Updates in real-time with activity

---

## 🔐 Security Notes

**This is a demo application:**
- Demo-only environment, no real value
- Passwords stored in plain text in localStorage (not production-ready)
- Admin PIN configurable via environment variable
- No real blockchain integration
- No real payment processing
- Not production-ready

**Admin PIN Configuration:**
Set `NEXT_PUBLIC_ADMIN_PIN` in your deployment environment to change the default PIN.

---

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Export Static Site
The application is built with Next.js App Router and uses client-side state management.

---

## 📝 Admin Credentials

- **Admin Panel PIN**: Configurable via `NEXT_PUBLIC_ADMIN_PIN` environment variable
- **Default (fallback)**: "1234"
- Access via footer link "Admin Panel"

---

## 🎮 Testing the Application

### Basic Flow
1. Visit the homepage (note global disclaimer banner)
2. Click "Explore Test Environment"
3. Browse 20 diverse athletes
4. Click an athlete card to view details
5. Click "Login" and create account
6. View demo session ID (simulated)
7. Acquire units (demo transaction)
8. Go to "My Page" → Fan Page tab
9. View demo portfolio and activity history
10. Release units
11. Check participation metrics

### Athlete Registration
1. Click "Register as Athlete"
2. Fill out the form completely
3. Submit (requires login)
4. Access footer "Admin Panel"
5. Enter PIN (default: 1234, or your configured PIN)
6. Review pending application
7. Approve with custom parameters
8. Return to directory and see new athlete
9. Login to check "My Page" → Athlete tab

---

## 🐛 Known Limitations

1. **No real blockchain** - Session ID is simulated
2. **LocalStorage only** - data lost on cache clear
3. **No backend** - all logic runs client-side
4. **Demo charts** - not connected to real data
5. **Static news** - articles don't update
6. **No email verification** - simple auth system
7. **Demo-only** - no real-world value or transfers

---

## 🎯 Compliance & Forbidden Terms

This build removes all investment/securities language:

**Removed terms:**
- investment, investor, invest, ROI, profit, yield, dividend, earnings, return
- guaranteed, speculation, asset class, financial markets, security, securities
- shares, stock, equity, ownership, pension, retirement income
- And Spanish equivalents

**Safe terms used:**
- Test Environment, Demo Credits (tATHLX), Athlete Units
- Activity Index (pts), Acquire Units, Release Units
- Post-Career Support Vault, Demo-only environment

---

## 📄 License

This is a demonstration project. All rights reserved.

---

## 👥 Contact

For questions or feedback about this demo pilot, please contact the development team.

---

## 🙏 Acknowledgments

- Built with Next.js, React, and TypeScript
- Icons by Lucide
- Charts by Chart.js
- Styled with Tailwind CSS
- Demo athlete images from Pravatar

---

**AthleteXchange (ATHLX) - Pilot Program for Testing Athlete Support Models**
