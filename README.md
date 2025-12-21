# AthleteXchange (ATHLX)

**A revolutionary digital platform where fans and investors can support athletes by trading athlete tokens**

🌐 **Live Demo**: https://3000-ip0f0nc2ffi4klmmd4lil-cc2fbc16.sandbox.novita.ai

---

## 📋 Project Overview

AthleteXchange (ATHLX) is a complete, fully wired demo web application that demonstrates a new financial ecosystem for athletes. The platform enables fans to invest directly in individual athletes through tradeable tokens, creating sustainable support mechanisms for players throughout their careers and beyond.

### Core Concept

> "Support becomes investment, and investment becomes lifelong protection for athletes."

Unlike traditional sports investment models focused on clubs and franchises, ATHLX creates a direct connection between fans and individual athletes, solving critical problems:
- Young talent often quit due to lack of funding
- Many athletes face economic hardship after retirement
- Fans have no direct way to financially support individual players
- Sports investment is limited to institutional opportunities

---

## ✨ Key Features

### 🏠 Landing Page
- Compelling hero section with clear value proposition
- "How It Works" 4-step flow
- Why ATHLX exists sections
- Newly listed and fast-growing athlete showcases

### 🏪 Athlete Token Market
- **20 diverse athletes** across Olympic sports (Football, Swimming, Tennis, Basketball, Athletics, Gymnastics, Volleyball, Boxing, Judo, Cycling, Rowing, Table Tennis, Badminton, Fencing, Weightlifting, Wrestling, Taekwondo, Archery, Shooting, Cricket, eSports)
- **Categories**: Amateur, Semi-pro, Pro, Elite
- Advanced filtering by sport, category, nationality
- Segments: New Athletes, Featured, Category Promotions, Fast Growing
- Real-time price display with 24h/7d changes
- Mini sparkline charts
- Trading volume and holder counts

### 👤 Athlete Detail Pages
- Comprehensive profile with bio and statistics
- **Live price chart** with multiple timeframes (1D/1W/1M)
- Embedded YouTube highlight videos
- Related news articles
- Buy/Sell trading interface with fee breakdown
- Real-time balance updates

### 💱 Trading System
- **5% trading fee** on all transactions
  - **2.5% immediate payout** to athletes
  - Remaining supports operations and Lifetime Support Vault
- Buy/Sell modal with clear price calculations
- Instant portfolio updates
- Trade history tracking
- Simulated MetaMask integration

### 👥 User Features

#### Fan Page
- Portfolio overview with ATHLX balance
- Holdings table with P/L tracking
- Trading history with detailed transaction log
- Impact metrics showing contribution to athletes

#### Athlete Page
- Token statistics (price, holders, volume)
- **Real-time support tracking**
- Total immediate payout earned (2.5% of trading volume)
- Link to public athlete profile

### 📝 Athlete Registration
- Multi-step registration form
- Sport selection across all Olympic sports
- Category request (Amateur to Elite)
- Bio and profile information
- Submission for admin approval

### 🔐 Admin Panel
- **Password protected** (password: `1234`)
- Dashboard with summary statistics
- Pending applications queue
- Detailed application review
- Approve/reject with customizable parameters
- Set initial token price and symbol
- Automatic market listing upon approval

### 📰 Sports News
- Curated news feed with athlete connections
- Filter by sport and category
- Related athlete token cards
- External article links

### ℹ️ About Page
- Comprehensive platform explanation
- Purpose & Vision sections
- Market opportunity analysis
- Token economy breakdown with visual diagrams
- Athlete Lifetime Support Vault details
- Governance & compliance information

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

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment
The application runs on `http://localhost:3000` by default.

---

## 📱 Application Structure

```
webapp/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Home page
│   ├── layout.tsx           # Root layout with navigation
│   ├── market/              # Market listing page
│   ├── athlete/[symbol]/    # Dynamic athlete detail pages
│   ├── about/               # About ATHLX page
│   ├── news/                # Sports news page
│   ├── my-page/             # User dashboard (Fan + Athlete views)
│   ├── register-athlete/    # Athlete registration form
│   └── admin/               # Admin panel (password protected)
├── components/              # Reusable React components
│   ├── Navigation.tsx       # Top navigation bar
│   ├── Footer.tsx           # Footer with admin link
│   ├── AuthModal.tsx        # Login/Signup modal
│   ├── TradeModal.tsx       # Buy/Sell trading interface
│   └── AdminPasswordModal.tsx
├── lib/                     # Core application logic
│   ├── types.ts             # TypeScript type definitions
│   ├── data.ts              # Initial athlete and news data
│   ├── store.tsx            # React Context state management
│   └── translations.ts      # EN/ES language support
└── public/                  # Static assets
```

---

## 🎯 User Flows

### Investor/Fan Flow
1. Browse market and filter athletes
2. Login/Sign up
3. Connect MetaMask (simulated)
4. View athlete details and charts
5. Execute buy trades (5% fee applied)
6. Monitor portfolio in My Page (Fan tab)
7. View P/L and trading history
8. Execute sell trades
9. Track impact on athlete support

### Athlete Flow
1. Browse platform as fan
2. Register as athlete with comprehensive form
3. Submit application (requires login)
4. Wait for admin approval
5. Upon approval, view stats in My Page (Athlete tab)
6. Monitor token trading volume
7. See real-time immediate payout accumulation
8. Track holder growth

### Admin Flow
1. Access footer "Admin Panel" link
2. Enter password: `1234`
3. Review dashboard statistics
4. Navigate to pending applications
5. Review application details
6. Set final category, initial price, token symbol
7. Approve → athlete listed on market
8. OR Reject with reason

---

## 💾 Data Persistence

All data is stored in browser **localStorage**:
- User accounts (email/password)
- Current user session
- Athlete tokens (initial 20 + approved registrations)
- Trading history
- Portfolio holdings
- Pending athlete applications
- News articles

**Reset**: Clear browser localStorage to reset all data.

---

## 🎨 Design Features

### Visual Style
- **Dark futuristic theme** with blue/purple gradients
- **Glass-morphism effects** for modern card UI
- **High contrast numbers** - all prices and amounts clearly visible
- Custom price display fonts with shadows
- Smooth hover animations and transitions
- Responsive design for mobile, tablet, desktop

### Color Coding
- **Green**: Positive price changes, buy actions
- **Red**: Negative price changes, sell actions
- **Blue**: Primary actions, platform branding
- **Purple**: Athlete-specific actions
- **Orange**: MetaMask connection

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

- **Language Toggle**: EN / ES in navigation
- Translations for core UI elements
- Easy to extend to additional languages

---

## 📊 Demo Data

### Athletes (20)
Diverse representation across:
- 15+ different sports
- 12+ nationalities
- All 4 categories (Amateur, Semi-pro, Pro, Elite)
- Price range: 85 - 850 ATHLX
- Various tags and segments

### News (12 articles)
- Coverage across multiple sports
- Related to specific athletes
- Recent dates
- Mix of performance, transfer, and career news

### Default User Balance
- 10,000 ATHLX upon login
- Updates in real-time with trades

---

## 🔐 Security Notes

**This is a demo application:**
- Passwords stored in plain text in localStorage
- Admin password hardcoded: `1234`
- No real blockchain integration
- No real payment processing
- Not production-ready

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
The application is built with Next.js App Router and uses client-side state management. For static export compatibility, remove dynamic routes or implement `generateStaticParams`.

---

## 📝 Admin Credentials

- **Admin Panel Password**: `1234`
- Access via footer link "Admin Panel"

---

## 🎮 Testing the Application

### Basic Flow
1. Visit the homepage
2. Click "Explore Market"
3. Browse 20 diverse athletes
4. Click an athlete card to view details
5. Click "Login" and create account
6. Connect MetaMask (simulated)
7. Execute a buy trade
8. Go to "My Page" → Fan Page tab
9. View portfolio and trading history
10. Execute a sell trade
11. Check impact metrics

### Athlete Registration
1. Click "Register as Athlete"
2. Fill out the form completely
3. Submit (requires login)
4. Access footer "Admin Panel"
5. Enter password `1234`
6. Review pending application
7. Approve with custom parameters
8. Return to market and see new athlete
9. Login to check "My Page" → Athlete tab

---

## 🐛 Known Limitations

1. **No real blockchain** - MetaMask connection is simulated
2. **LocalStorage only** - data lost on cache clear
3. **No backend** - all logic runs client-side
4. **Dummy price charts** - not connected to real market data
5. **Static news** - articles don't update
6. **No email verification** - simple auth system

---

## 🎯 Future Enhancements

- Real blockchain integration (Ethereum, Polygon, etc.)
- Smart contract deployment for athlete tokens
- Backend API with database
- Real-time price feeds
- Social features (comments, likes, shares)
- Athlete verification system
- KYC/AML compliance
- Mobile apps (iOS/Android)
- Advanced analytics and charts
- Multi-chain support

---

## 📄 License

This is a demonstration project. All rights reserved.

---

## 👥 Contact

For questions or feedback about this demo project, please contact the development team.

---

## 🙏 Acknowledgments

- Built with Next.js, React, and TypeScript
- Icons by Lucide
- Charts by Chart.js
- Styled with Tailwind CSS
- Demo athlete images from Pravatar

---

**AthleteXchange (ATHLX) - Transforming athlete support through decentralized finance**
