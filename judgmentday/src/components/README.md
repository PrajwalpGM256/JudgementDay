# Reusable Components

This directory contains all reusable UI components for the JudgmentDay application.

## Component Structure

### Layout Components (`/components/layout`)

#### Navbar
A persistent navigation component used across dashboard pages.

**Props:**
- `userName?: string` - Display name of the logged-in user
- `onLogout?: () => void` - Logout handler function

**Usage:**
```tsx
import Navbar from "@/components/layout/Navbar";

<Navbar userName="John Doe" onLogout={handleLogout} />
```

---

### UI Components (`/components/ui`)

#### Button
A flexible button component with multiple variants and sizes.

**Props:**
- `variant?: "primary" | "secondary" | "danger" | "success" | "outline"` - Button style (default: "primary")
- `size?: "sm" | "md" | "lg"` - Button size (default: "md")
- `children: ReactNode` - Button content
- All standard HTML button attributes

**Usage:**
```tsx
import Button from "@/components/ui/Button";

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

---

#### Card
A basic container card with optional padding.

**Props:**
- `children: ReactNode` - Card content
- `className?: string` - Additional CSS classes
- `padding?: boolean` - Apply default padding (default: true)

**Usage:**
```tsx
import Card from "@/components/ui/Card";

<Card>
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>
```

---

#### StatCard
A specialized card for displaying statistics.

**Props:**
- `label: string` - Stat label
- `value: string | number` - Main stat value
- `subtitle?: string` - Optional subtitle text
- `color?: "blue" | "green" | "yellow" | "purple" | "red"` - Color theme (default: "blue")

**Usage:**
```tsx
import StatCard from "@/components/ui/StatCard";

<StatCard 
  label="Total Points"
  value={156}
  subtitle="Rank #3 of 12"
  color="blue"
/>
```

---

#### LeagueCard
A card displaying league information with standings.

**Props:**
- `id: string` - League ID
- `name: string` - League name
- `commissioner: string` - Commissioner name
- `members: number` - Number of members
- `standings?: Array<{rank: number, name: string, points: number, isCurrentUser?: boolean}>` - Top standings

**Usage:**
```tsx
import LeagueCard from "@/components/ui/LeagueCard";

<LeagueCard
  id="league-1"
  name="Friends League"
  commissioner="John Doe"
  members={12}
  standings={[
    { rank: 1, name: "Player1", points: 156 },
    { rank: 2, name: "You", points: 143, isCurrentUser: true }
  ]}
/>
```

---

#### FeatureCard
A card for displaying feature information on the landing page.

**Props:**
- `icon: string` - Emoji or icon
- `title: string` - Feature title
- `description: string` - Feature description

**Usage:**
```tsx
import FeatureCard from "@/components/ui/FeatureCard";

<FeatureCard 
  icon="🎯"
  title="Strategic Picks"
  description="Assign confidence points to each game."
/>
```

---

#### Input
A form input component with label and error support.

**Props:**
- `label?: string` - Input label
- `error?: string` - Error message
- All standard HTML input attributes

**Usage:**
```tsx
import Input from "@/components/ui/Input";

<Input
  type="email"
  label="Email"
  placeholder="your@email.com"
  error={errors.email}
/>
```

---

## Importing Components

You can import components individually or use the index exports:

```tsx
// Individual imports
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

// Or use index exports
import { Button, Card, StatCard } from "@/components/ui";
import { Navbar } from "@/components/layout";
```

## Benefits of This Structure

1. **Consistency** - All buttons, cards, and inputs look and behave the same
2. **Maintainability** - Update styles in one place, affects all instances
3. **Reusability** - Easily use components across different pages
4. **Type Safety** - Full TypeScript support with proper prop types
5. **Customization** - Props allow flexibility without duplicating code
