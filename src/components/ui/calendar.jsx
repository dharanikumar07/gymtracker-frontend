import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const YEARS = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 7 + i)

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function Calendar({
  className,
  selected,
  onSelect,
  mode = "single",
  showOutsideDays = true,
  ...props
}) {
  const initialDate = selected || new Date()
  const [viewMonth, setViewMonth] = React.useState(initialDate.getMonth())
  const [viewYear, setViewYear] = React.useState(initialDate.getFullYear())
  const [showMonthDropdown, setShowMonthDropdown] = React.useState(false)
  const [showYearDropdown, setShowYearDropdown] = React.useState(false)
  const containerRef = React.useRef(null)
  const yearListRef = React.useRef(null)

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowMonthDropdown(false)
        setShowYearDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll to selected year when year dropdown opens
  React.useEffect(() => {
    if (showYearDropdown && yearListRef.current) {
      const activeBtn = yearListRef.current.querySelector('[data-active="true"]')
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'center', behavior: 'instant' })
      }
    }
  }, [showYearDropdown])

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const handleMonthSelect = (monthIndex) => {
    setViewMonth(monthIndex)
    setShowMonthDropdown(false)
  }

  const handleYearSelect = (year) => {
    setViewYear(year)
    setShowYearDropdown(false)
  }

  const handleDateSelect = (d) => {
    if (onSelect) {
      // Use local date constructor to avoid timezone displacement
      onSelect(new Date(d.year, d.month, d.day))
    }
  }

  // Build calendar grid
  const totalDays = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1)
  const days = []

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const m = viewMonth === 0 ? 11 : viewMonth - 1
    const y = viewMonth === 0 ? viewYear - 1 : viewYear
    days.push({ day, month: m, year: y, outside: true })
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    days.push({ day: d, month: viewMonth, year: viewYear, outside: false })
  }

  // Next month leading days
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1
    const y = viewMonth === 11 ? viewYear + 1 : viewYear
    days.push({ day: d, month: m, year: y, outside: true })
  }

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  const selectedStr = selected
    ? `${selected.getFullYear()}-${selected.getMonth()}-${selected.getDate()}`
    : null

  return (
    <div ref={containerRef} className={cn("w-full p-4", className)}>
      {/* ─── Header: < Apr ▼  2026 ▼ > ─── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-transparent hover:bg-accent transition-colors flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => { setShowMonthDropdown(!showMonthDropdown); setShowYearDropdown(false) }}
            className="flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-md hover:bg-accent transition-colors"
          >
            {MONTHS[viewMonth].slice(0, 3)}
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
          <button
            onClick={() => { setShowYearDropdown(!showYearDropdown); setShowMonthDropdown(false) }}
            className="flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-md hover:bg-accent transition-colors"
          >
            {viewYear}
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>

        <button
          onClick={handleNextMonth}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-transparent hover:bg-accent transition-colors flex-shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ─── Month Dropdown ─── */}
      {showMonthDropdown && (
        <div className="mb-4 bg-secondary/30 border border-border rounded-lg p-2">
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((month, index) => (
              <button
                key={index}
                onClick={() => handleMonthSelect(index)}
                className={cn(
                  "px-2 py-2 text-xs font-medium rounded-md transition-colors text-center",
                  viewMonth === index
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-foreground"
                )}
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Year Dropdown ─── */}
      {showYearDropdown && (
        <div ref={yearListRef} className="mb-4 bg-secondary/30 border border-border rounded-lg p-2 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-3 gap-1">
            {YEARS.map((year, index) => (
              <button
                key={index}
                data-active={viewYear === year}
                onClick={() => handleYearSelect(year)}
                className={cn(
                  "px-2 py-2 text-xs font-medium rounded-md transition-colors text-center",
                  viewYear === year
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-foreground"
                )}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Weekday Labels ─── */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d, index) => (
          <div key={index} className="h-9 flex items-center justify-center text-sm font-normal text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* ─── Date Grid ─── */}
      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          const dateStr = `${d.year}-${d.month}-${d.day}`
          const isSelected = selectedStr === dateStr
          const isToday = todayStr === dateStr
          const isOutside = d.outside

          if (isOutside && !showOutsideDays) {
            return <div key={i} className="h-10" />
          }

          return (
            <button
              key={i}
              onClick={() => handleDateSelect(d)}
              className={cn(
                "h-10 flex items-center justify-center text-sm rounded-lg transition-colors",
                isOutside && "text-muted-foreground/40",
                !isOutside && !isSelected && !isToday && "text-foreground hover:bg-accent",
                isToday && !isSelected && "bg-accent text-accent-foreground font-medium",
                isSelected && "bg-primary text-primary-foreground font-semibold"
              )}
            >
              {d.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
