# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

Do not create custom components. If a UI element is needed, find the appropriate shadcn/ui component and use it. If shadcn/ui does not offer a component for a particular need, compose using existing shadcn/ui primitives rather than building from scratch.

To add a new shadcn/ui component:

```bash
npx shadcn@latest add <component-name>
```

Components are installed into `src/components/ui/` and can be imported from there:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
```

## Date Formatting

Use `date-fns` for all date formatting. Do not use `toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting approach.

Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the `do MMM yyyy` format string with `date-fns/format`:

```ts
import { format } from "date-fns"

format(date, "do MMM yyyy")
// → "1st Sep 2025"
// → "2nd Aug 2025"
// → "3rd Jan 2026"
```
