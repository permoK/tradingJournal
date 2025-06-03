# Demo/Real Trade Toggle Feature

## Overview
The trading journal now supports a demo/real trade toggle that allows users to switch between recording demo trades and real trades. This feature provides a seamless way to practice trading strategies without affecting real trading data.

## Key Features

### 1. Trade Mode Toggle
- **Location**: Available on Dashboard, Trading pages, New Trade, and Edit Trade pages
- **Persistence**: Mode preference is saved in localStorage and persists across sessions
- **Visual Indicators**: Clear visual feedback showing current mode (Demo/Real)

### 2. Automatic Trade Classification
- **Demo Mode**: All new trades are automatically marked as demo trades
- **Real Mode**: All new trades are marked as real trades
- **Mode Switching**: Users can switch modes at any time

### 3. Data Separation
- **Filtered Views**: Dashboard and trading pages show only trades matching the current mode
- **Independent Statistics**: P/L calculations, win rates, and charts reflect only the current mode's data
- **Visual Indicators**: Demo trades are clearly marked with amber badges and icons

## Implementation Details

### Database Changes
- Added `is_demo` boolean column to the `trades` table
- Default value: `false` (real trades)
- Migration script provided: `migration-add-is-demo.sql`

### New Components
1. **TradeModeContext** (`src/contexts/TradeModeContext.tsx`)
   - Manages global demo/real mode state
   - Persists preference in localStorage
   - Provides toggle functionality

2. **TradeModeToggle** (`src/components/TradeModeToggle.tsx`)
   - Visual toggle switch component
   - Shows current mode with color coding
   - Includes mode labels and demo badge

### Updated Components
1. **Dashboard** (`src/app/dashboard/page.tsx`)
   - Filters trades based on current mode
   - Shows mode toggle in header
   - Displays mode-specific statistics

2. **Trading Pages** (`src/app/trading/`)
   - New Trade: Auto-sets `is_demo` based on current mode
   - Edit Trade: Updates `is_demo` field when saving
   - Trading List: Filters and displays trades by mode

3. **Trade Components**
   - SavedTradeCard: Shows demo indicators
   - Trade tables: Display demo badges
   - Updated interfaces to include `isDemo` field

### API Changes
- Updated `useTrades` hook to accept `isDemoMode` parameter
- Modified trade creation/update functions to handle `is_demo` field
- Enhanced filtering in database queries

## User Experience

### Visual Indicators
- **Demo Mode Active**: Amber toggle, "Demo" badge, warning messages
- **Real Mode Active**: Green toggle, "Real Trading" label
- **Demo Trades**: Amber badges with pause icon in trade lists
- **Mode Switching**: Instant data filtering when toggling modes

### Workflow
1. **Default State**: Real mode (existing behavior)
2. **Switch to Demo**: Toggle to demo mode, all new trades marked as demo
3. **Practice Trading**: Record demo trades without affecting real data
4. **Switch Back**: Toggle to real mode, return to real trading data
5. **Data Separation**: Each mode shows only relevant trades and statistics

## Benefits

### For New Traders
- Practice recording trades without affecting real data
- Learn the interface with demo trades
- Build confidence before real trading

### For Experienced Traders
- Test new strategies in demo mode
- Keep practice trades separate from real performance
- Maintain clean real trading records

### For All Users
- Clear separation between practice and real trading
- No risk of mixing demo and real trade data
- Seamless switching between modes

## Technical Notes

### State Management
- Uses React Context for global state
- localStorage for persistence
- Automatic hydration on app load

### Database Design
- Non-breaking change (existing trades remain real)
- Efficient filtering with indexed boolean column
- Backward compatibility maintained

### Performance
- Minimal impact on existing functionality
- Efficient database queries with proper indexing
- Client-side filtering for instant mode switching

## Migration Instructions

1. **Database Migration**:
   ```sql
   -- Run in Supabase SQL editor
   ALTER TABLE trades ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
   UPDATE trades SET is_demo = false WHERE is_demo IS NULL;
   ```

2. **Code Deployment**:
   - Deploy updated codebase
   - TradeModeProvider is automatically available
   - No additional configuration required

3. **User Experience**:
   - Existing users start in real mode (default)
   - All existing trades remain as real trades
   - Users can immediately start using demo mode

## Future Enhancements

### Potential Features
- Demo trade templates/scenarios
- Demo mode tutorials
- Performance comparison between demo and real
- Demo trade expiration/cleanup
- Import/export demo strategies

### Analytics
- Track demo vs real mode usage
- Monitor demo trade patterns
- Analyze learning progression

## Support

### Troubleshooting
- Mode not persisting: Check localStorage permissions
- Trades not filtering: Verify database migration
- Toggle not working: Check TradeModeProvider wrapper

### Common Issues
- **Mixed Data**: Ensure proper mode when recording trades
- **Missing Trades**: Check current mode matches desired view
- **Performance**: Demo mode should not affect real trade performance metrics
