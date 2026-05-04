"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar } from "lucide-react"
import { cn } from "@/src/shared/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/shared/components/global/ui/popover"
import { Button } from "@/src/shared/components/global/ui/button"

interface DateInputProps {
  value?: string // ISO string YYYY-MM-DD or empty
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function formatToDisplay(iso: string): string {
  if (!iso) return ""
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return ""
  return `${d}/${m}/${y}`
}

function parseDisplayToISO(display: string): string {
  const clean = display.replace(/\D/g, "")
  if (clean.length < 8) return ""
  const d = clean.slice(0, 2)
  const m = clean.slice(2, 4)
  const y = clean.slice(4, 8)
  const date = new Date(`${y}-${m}-${d}`)
  if (isNaN(date.getTime())) return ""
  return `${y}-${m}-${d}`
}

function applyMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function getDaysInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay()
  const days = []

  const prevLast = new Date(year, month, 0).getDate()
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, prevLast - i), current: false })
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), current: true })
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), current: false })
  }
  return days
}

export function DateInput({ value, onChange, placeholder = "DD/MM/AAAA", className }: DateInputProps) {
  const [inputValue, setInputValue] = useState(formatToDisplay(value || ""))
  const [open, setOpen] = useState(false)
  const [displayMonth, setDisplayMonth] = useState(() => {
    if (value) {
      const d = new Date(value + "T00:00:00")
      if (!isNaN(d.getTime())) return d
    }
    return new Date()
  })

  const prevValueRef = useRef(value)
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value
      setInputValue(formatToDisplay(value || ""))
      if (value) {
        const d = new Date(value + "T00:00:00")
        if (!isNaN(d.getTime())) setDisplayMonth(d)
      }
    }
  }, [value])

  const selectedISO = parseDisplayToISO(inputValue)
  const selectedDate = selectedISO ? new Date(selectedISO + "T00:00:00") : null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(e.target.value)
    setInputValue(masked)
    const iso = parseDisplayToISO(masked)
    onChange(iso)
  }

  const handleDayClick = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    const iso = `${y}-${m}-${d}`
    setInputValue(formatToDisplay(iso))
    onChange(iso)
    setOpen(false)
  }

  const days = getDaysInMonth(displayMonth.getFullYear(), displayMonth.getMonth())
  const monthLabel = displayMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        maxLength={10}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))}
              className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="text-sm font-medium capitalize">{monthLabel}</span>
            <button
              type="button"
              onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))}
              className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Do", "Se", "Te", "Qa", "Qi", "Sx", "Sá"].map((d) => (
              <div key={d} className="w-9 h-9 flex items-center justify-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString()
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => day.current && handleDayClick(day.date)}
                  disabled={!day.current}
                  className={cn(
                    "w-9 h-9 text-sm rounded-md transition-colors cursor-pointer",
                    "hover:bg-accent hover:text-accent-foreground",
                    !day.current && "text-muted-foreground opacity-40 cursor-not-allowed",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  {day.date.getDate()}
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
