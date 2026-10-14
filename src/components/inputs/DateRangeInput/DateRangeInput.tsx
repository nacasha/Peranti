import { clsx } from "clsx"
import dayjs from "dayjs"
import RCTooltip from "rc-tooltip"
import { type FC, useEffect, useRef, useState } from "react"
import { DayPicker, type DateRange as DayPickerRange } from "react-day-picker"
import "react-day-picker/style.css"

import { Button } from "src/components/common/Button"
import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { Icons } from "src/constants/icons"
import { type InputComponentProps } from "src/types/InputComponentProps"

// The popover, calendar and time row look like the DateTime field's
import "../DateTimeInput/DateTimeInput.scss"

import {
  type DateRange,
  type DateRangePreset,
  DEFAULT_DATE_RANGE_PRESETS,
  formatDateRangeEnd,
  ISO_FORMAT,
  isRelative,
  normalizeDateRangeEnd,
  resolveDateRangeEnd,
  toDateRange
} from "./date-range.ts"

import "./DateRangeInput.scss"

/**
 * Calendar navigation range, as in the DateTime field: with the year dropdown
 * on, DayPicker otherwise stops at the end of the current year
 */
const CALENDAR_YEARS_SPAN = 100
const START_MONTH = dayjs().subtract(CALENDAR_YEARS_SPAN, "year").startOf("year").toDate()
const END_MONTH = dayjs().add(CALENDAR_YEARS_SPAN, "year").endOf("year").toDate()

/**
 * Two months side by side, the range's end in the right one, so a range
 * reaching back into last month shows whole
 */
const NUMBER_OF_MONTHS = 2
const firstShownMonth = (end?: dayjs.Dayjs) => (end ?? dayjs()).subtract(NUMBER_OF_MONTHS - 1, "month").startOf("month").toDate()

interface DateRangeInputProps extends InputComponentProps<DateRange> {
  presets?: DateRangePreset[]
}

/**
 * A start and an end, each typed as a date or relative to now ("now-15m").
 * The button on the left opens quick ranges and a calendar: picking days
 * keeps the times of day, and the time fields set them.
 * The value is `{ start, end }`; dates are kept as ISO with the local offset.
 */
export const DateRangeInput: FC<DateRangeInputProps> = (props) => {
  const { label, fieldKey, value, readOnly, presets = DEFAULT_DATE_RANGE_PRESETS, onValueChange } = props

  const range = toDateRange(value)
  const start = resolveDateRangeEnd(range.start)
  const end = resolveDateRangeEnd(range.end)
  const isInverted = Boolean(start && end && start.isAfter(end))

  // What is being typed, so a half-typed date isn't rewritten under the cursor
  const [drafts, setDrafts] = useState<Partial<DateRange>>({})
  const [isOpen, setIsOpen] = useState(false)
  const [month, setMonth] = useState(() => firstShownMonth(end))

  /**
   * The From day of a pick in progress: the first click starts a new range on
   * that day, the second sets its To (or its From, when it is earlier). The
   * calendar's own range mode would move the nearest end instead.
   */
  const [pickingFrom, setPickingFrom] = useState<dayjs.Dayjs>()
  const anchorRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (!anchorRef.current?.contains(target) && !popupRef.current?.contains(target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const commit = (next: Partial<DateRange>) => {
    onValueChange({ ...range, ...next })
  }

  // A pick left half done starts over next time
  useEffect(() => {
    setPickingFrom(undefined)
  }, [isOpen])

  const togglePicker = () => {
    if (!isOpen) {
      setMonth(firstShownMonth(end))
    }
    setIsOpen(!isOpen)
  }

  const pickPreset = (preset: DateRangePreset) => {
    setDrafts({})
    commit({ start: preset.start, end: preset.end })
    setIsOpen(false)
  }

  /**
   * Picked days cover whole days, 00:00:00 to 23:59:59, unless an end was
   * already a date, which keeps its time of day
   */
  const commitDays = (from: dayjs.Dayjs, to: dayjs.Dayjs) => {
    const startTime = start && !isRelative(range.start) ? start : from.startOf("day")
    const endTime = end && !isRelative(range.end) ? end : to.endOf("day")
    setDrafts({})
    commit({
      start: from.hour(startTime.hour()).minute(startTime.minute()).second(startTime.second()).millisecond(0).format(ISO_FORMAT),
      end: to.hour(endTime.hour()).minute(endTime.minute()).second(endTime.second()).millisecond(0).format(ISO_FORMAT)
    })
  }

  const onDayClick = (_selected: DayPickerRange | undefined, clicked: Date) => {
    const day = dayjs(clicked)
    if (!pickingFrom) {
      setPickingFrom(day)
      commitDays(day, day)
      return
    }
    setPickingFrom(undefined)
    if (day.isBefore(pickingFrom, "day")) {
      commitDays(day, pickingFrom)
    } else {
      commitDays(pickingFrom, day)
    }
  }

  const onTimeChange = (key: keyof DateRange, text: string) => {
    const base = key === "start" ? start : end
    const [hour = 0, minute = 0, second = 0] = text.split(":").map(Number)
    setDrafts({})
    commit({ [key]: (base ?? dayjs()).hour(hour).minute(minute).second(second).millisecond(0).format(ISO_FORMAT) })
  }

  const renderEnd = (key: keyof DateRange, placeholder: string) => {
    const text = drafts[key] ?? formatDateRangeEnd(range[key])
    const isInvalid = range[key].trim() !== "" && !resolveDateRangeEnd(range[key])

    return (
      <input
        className={clsx("DateRangeInput-end", { invalid: isInvalid || (isInverted && key === "start") })}
        value={text}
        placeholder={placeholder}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        autoComplete="off"
        spellCheck={false}
        aria-label={key === "start" ? "From" : "To"}
        title={isInverted && key === "start" ? "Starts after it ends" : resolveDateRangeEnd(range[key])?.format("YYYY-MM-DD HH:mm:ss Z")}
        onChange={(event) => {
          setDrafts({ ...drafts, [key]: event.target.value })
          commit({ [key]: normalizeDateRangeEnd(event.target.value) })
        }}
        onBlur={() => { setDrafts({ ...drafts, [key]: undefined }) }}
      />
    )
  }

  const activePreset = presets.find((preset) => preset.start === range.start.trim() && preset.end === range.end.trim())

  return (
    <div className="DateRangeInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <div className="DateRangeInput-field">
        <RCTooltip
          prefixCls="DateTimeInput-popover"
          visible={isOpen}
          trigger={[]}
          placement="bottomLeft"
          destroyTooltipOnHide
          zIndex={1000}
          overlay={(
            <div className="DateTimeInput-popover-panel DateRangeInput-panel" ref={popupRef} role="dialog" aria-label={label}>
              <div className="DateRangeInput-side">
                <ul className="DateRangeInput-presets" aria-label="Quick ranges">
                  {presets.map((preset) => (
                    <li key={`${preset.start}|${preset.end}`}>
                      <button
                        type="button"
                        className={clsx({ active: preset === activePreset })}
                        onClick={() => { pickPreset(preset) }}
                      >
                        {preset.label}
                      </button>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  className="DateRangeInput-untilNow"
                  disabled={range.end.trim() === "now"}
                  onClick={() => { setDrafts({}); commit({ end: "now" }) }}
                >
                  Until now
                </Button>
              </div>
              <div className="DateRangeInput-calendar">
                <DayPicker
                  mode="range"
                  numberOfMonths={NUMBER_OF_MONTHS}
                  captionLayout="dropdown"
                  startMonth={START_MONTH}
                  endMonth={END_MONTH}
                  selected={start ? { from: start.toDate(), to: end?.toDate() } : undefined}
                  onSelect={onDayClick}
                  month={month}
                  onMonthChange={setMonth}
                />
                <div className="DateTimeInput-popover-time DateRangeInput-times">
                  <input
                    type="time"
                    step={1}
                    aria-label="From time"
                    value={start?.format("HH:mm:ss") ?? ""}
                    onChange={(event) => { onTimeChange("start", event.target.value) }}
                  />
                  <span className="DateRangeInput-arrow" aria-hidden>→</span>
                  <input
                    type="time"
                    step={1}
                    aria-label="To time"
                    value={end?.format("HH:mm:ss") ?? ""}
                    onChange={(event) => { onTimeChange("end", event.target.value) }}
                  />
                </div>
              </div>
            </div>
          )}
        >
          <button
            ref={anchorRef}
            type="button"
            className={clsx("DateTimeInput-trigger", { active: isOpen })}
            onClick={togglePicker}
            disabled={readOnly}
            aria-label="Pick a range"
            aria-expanded={isOpen}
          >
            <Icons.Calendar size={15} />
          </button>
        </RCTooltip>
        {renderEnd("start", "now-1h")}
        <span className="DateRangeInput-arrow" aria-hidden>→</span>
        {renderEnd("end", "now")}
        {activePreset && <span className="DateRangeInput-preset">{activePreset.label}</span>}
      </div>
    </div>
  )
}
