# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Environment Setup
- Create `.env` file with required AWS credentials:
  ```
  AWS_ACCESS_KEY_ID=
  AWS_SECRET_ACCESS_KEY=
  AWS_DEFAULT_REGION=
  PORT=3000
  ```

### Running the Application
- **Local development**: `node app.js`
- **Docker container**: `docker run -v "<path>/:/app" -w /app -p 3000:3000 node:18-slim bash -c "npm install && node app.js"`
- **Install dependencies**: `npm install --legacy-peer-deps`

## Architecture Overview

### Core Components
- **app.js**: Main Express server with session management, routing, and middleware
- **dynamo.js**: AWS DynamoDB client wrapper with CRUD operations for all data tables
- **models/user.js**: Simple user model constructor

### Database Tables (DynamoDB)
- `afterdark-quotes`: Main quotes storage
- `afterdark-quote-ratings`: User ratings for quotes
- `limbo-afterdark-quotes`: Pending quotes awaiting approval
- `afterdark_quotes_members`: User/member information

### Key Features
- **Quote Rating System**: Users can rate quotes 1-10 with slider interface and confetti celebration
- **Limbo System**: Two-stage approval process for quotes (limbo → approved)
- **Session Management**: User identity selection and session persistence
- **Handlebars Templates**: Server-side rendering with custom JSON helper
- **Interactive Rating Interface**: Slider with visual feedback, emoji indicators, and celebration effects
- **Analytics Dashboard**: Quote details page with Chart.js visualizations and rating statistics

### Application Flow
1. Users select identity on `/identity` route
2. Rate random quotes on `/rate` route
3. Admin can approve/reject quotes from `/limbo`
4. View all quotes and ratings on `/leaderboard`
5. Individual quote details at `/quote/:message_id`

### Data Handling
- All message IDs are stored as BigInt for Discord compatibility
- Session stores user ID and nickname for rating attribution
- Ratings are arrays of objects with sessionUserID and rating values
- Quote approval moves items from limbo table to main quotes table
- Rating updates use find-and-replace logic: existing user ratings are removed and re-added to preserve order
- Data type conversions between BigInt/Number for DynamoDB compatibility throughout the application

### Static Assets
- Bootstrap 5.0.1 for styling
- jQuery for client-side interactions
- Chart.js 4.4.8 for data visualization
- Canvas-confetti library for celebration effects
- Custom CSS/JS in `/public` directory
- Shared utilities: `/public/js/dateUtils.js` for timestamp formatting across pages
- Archive folder contains legacy HTML pages

### Frontend Architecture
- **Main Layout**: `views/layouts/main.handlebars` with fixed navigation and background styling
- **Mobile-First Design**: Responsive breakpoints with custom mobile adaptations
- **Shared Utilities**: Date formatting handled by reusable `dateUtils.js` with automatic `format-date` class detection
- **Interactive Elements**: Form submissions with celebration effects and delayed redirects

### Important Implementation Details
- Rating system prevents duplicate votes per user by comparing sessionUserID strings (not numbers) to avoid precision loss
- Quote pages use mobile-responsive design with overflow handling for fixed-height layouts
- Date timestamps automatically formatted from DynamoDB format to readable format using shared utility
- Confetti celebrations are performance-optimized with limited duration to prevent lag