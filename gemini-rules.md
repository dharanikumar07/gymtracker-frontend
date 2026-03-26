# Gemini Agent Rules

## 1. useEffect Usage
- Do NOT use the `useEffect` hook by default.
- Avoid using `useEffect` unless it is absolutely necessary.
- If you use `useEffect`, you MUST clearly explain:
  - Why it is needed
  - Why it cannot be avoided

---

## 2. API Calls & Data Fetching
- Do NOT use `useEffect` for API calls.
- ALWAYS use React Query (TanStack Query) for:
  - Fetching data
  - Mutations (POST, PUT, DELETE)
  - Caching and state management

---

## 3. Preferred Approach
- Use `useQuery` for fetching data
- Use `useMutation` for updates
- Use query invalidation instead of manual state updates

---

## 4. Code Quality
- Keep code clean and readable
- Avoid unnecessary complexity
- Follow best practices

---

## 5. Ternary Over If Statements
- Use ternary operators (`condition ? true : false`) instead of if statements
- Avoid if statements for conditional rendering and simple conditionals
- Only use if statements when absolutely necessary (e.g., complex business logic)
- Example:
  ```jsx
  // Good
  {isActive ? <ActiveComponent /> : <InactiveComponent />}
  
  // Avoid
  {if (isActive) return <ActiveComponent />}
  ```

---

## 6. Explanation Rule
- If any rule is broken, you MUST:
  - Clearly explain why
  - Justify the decision