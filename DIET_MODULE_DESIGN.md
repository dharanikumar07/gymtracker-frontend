# Diet Module — Frontend Design

## Folder Structure

```
TrackProgress/
├── Diet/
│   ├── index.jsx                    # Main page: plan card + tracking
│   ├── context/
│   │   └── DietContext.jsx          # Provider: plan, date, meals, saveLog
│   ├── http/
│   │   ├── api.js                   # fetchDietRoutine, fetchTracking, generatePlan, saveDietLog
│   │   └── queries.js               # React Query hooks + mutations
│   └── components/
│       ├── DietPlanCard.jsx         # Plan info + goal generator (like Routine/PlanCard)
│       ├── MacroSummary.jsx         # 4 macro progress cards (Calories, Protein, Carbs, Fats)
│       ├── MealSection.jsx          # Expandable section per meal_type
│       └── FoodItem.jsx             # Individual food log card with toggle + quantity
```

## Page Flow

```
[No active plan?]
  └── DietPlanCard (full-width)
        ├── Goal Selector: weight_loss | muscle_gain | maintenance
        ├── Diet Preference: veg | non_veg | vegan
        ├── Plan Name (optional)
        └── Generate Button → POST /diet/routine

[Active plan exists?]
  ├── DietPlanCard (compact: plan info + macro targets + switch plan)
  ├── DaySelector (7-day week strip, reuses WorkoutLog pattern)
  ├── MacroSummary (4 cards: consumed / target for each macro)
  └── MealSections (Breakfast → Lunch → Dinner → Snack)
        └── FoodItem × N per section
              ├── Food name, prescribed qty/macros
              ├── Toggle to log (tick = use prescribed values)
              └── When logged: editable qty, auto macros display
```

## Tab Change

Merging "Diet" + "Manage Diet" into a single **Diet** tab (3 tabs total):
- Routine | Workout | Diet

The Diet tab handles both plan management AND daily tracking on the same page,
identical to how Routine shows PlanCard + SlotsCard together.

## API Endpoints Used

| Action | Method | Endpoint | Purpose |
|--------|--------|----------|---------|
| Get routine | GET | `/diet/routine?plan_uuid=` | Active plan + grouped meals |
| Generate plan | POST | `/diet/routine` | Create new plan from goal |
| Update routine | PATCH | `/diet/routine` | Edit meal items |
| Set active | POST | `/diet/routine/active` | Switch active plan |
| Get tracking | GET | `/diet/tracking?date=` | Prescribed vs logged for date |
| Save log | POST | `/diet/tracking` | Log actual food intake |

## API Response Structures

### GET /diet/tracking?date=2026-04-13
```json
{
  "date": "2026-04-13",
  "day": "sun",
  "meals": {
    "breakfast": [
      {
        "diet_plan_item_uuid": "uuid",
        "food_name": "Oats",
        "prescribed": { "quantity": 100, "unit": "g", "calories": 389, "macros": { "p": 17, "c": 66, "f": 7 } },
        "logged": null | { "uuid": "...", "quantity": 100, "unit": "g", "calories": 389, "macros": {...}, "notes": "" }
      }
    ],
    "lunch": [...],
    "dinner": [...],
    "snack": [...]
  }
}
```

### POST /diet/tracking
```json
{
  "date": "2026-04-13",
  "logs": [
    {
      "diet_plan_item_uuid": "uuid",
      "actual_quantity": 120,
      "unit": "g",
      "calories": 467,
      "protein": 20,
      "carbs": 79,
      "fats": 8,
      "notes": ""
    }
  ]
}
```

### GET /diet/routine
```json
{
  "plan": { "uuid", "name", "start_date", "end_date", "is_active", "target_calories", "target_protein", "target_carbs", "target_fats" },
  "routine": { "Mon": { "breakfast": [...], "lunch": [...], ... }, ... },
  "available_plans": [{ "plan_uuid", "name", "is_active" }]
}
```

## Component Specs

### DietPlanCard
- **No plan state**: Full generator form
  - Goal pills (3 options), preference pills (3 options)
  - Plan name input, Generate button
- **Has plan state**: Compact info card
  - Plan name + active badge
  - 4 macro targets row (calories, protein, carbs, fats)
  - Plan dropdown to switch
  - "Generate New" button (expandable)

### MacroSummary
- 4 stat cards in a grid row
- Each: icon + label + "consumed / target" + progress bar
- Colors: Calories (orange), Protein (blue), Carbs (amber), Fats (rose)

### MealSection
- Collapsible card per meal type
- Header: meal icon + name + "X/Y logged" badge
- Icons: Breakfast (Coffee), Lunch (Sun), Dinner (Moon), Snack (Cookie)
- Expanded: list of FoodItem cards

### FoodItem
- Food name + prescribed qty (e.g., "100g")
- Macro chips: P:17g C:66g F:7g
- Toggle button: unchecked → gray, checked → green (uses prescribed values as defaults)
- When logged: inline editable quantity input, macros auto-display
- Green border/bg when logged

## Design Tokens (consistent with existing app)
- Card: `bg-card border border-border rounded-2xl shadow-sm`
- Labels: `text-[8px] font-black uppercase tracking-widest text-muted-foreground`
- Values: `text-[14px]-[18px] font-black text-foreground`
- Primary action: `bg-primary text-white`
- Green accents for logged/completed states
- Meal colors: breakfast=orange, lunch=yellow, dinner=purple, snack=pink
