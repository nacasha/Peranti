import { clsx } from "clsx"
import dayjs, { type Dayjs } from "dayjs"
import RCTooltip from "rc-tooltip"
import { type FC, type InputHTMLAttributes, useEffect, useRef, useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { Button } from "src/components/common/Button"
import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { Tooltip } from "src/components/common/Tooltip"
import { Icons } from "src/constants/icons"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./DateTimeInput.scss"

const DATE_FORMAT = "YYYY-MM-DD"
const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss"

/**
 * Whether a typed value carries a time, so a date-only value stays date-only
 */
const TIME_PATTERN = /\d{1,2}:\d{2}/

/**
 * Calendar navigation range. With the year dropdown on, DayPicker otherwise
 * stops at the end of the current year, hiding every future date.
 */
const CALENDAR_YEARS_SPAN = 100
const START_MONTH = dayjs().subtract(CALENDAR_YEARS_SPAN, "year").startOf("year").toDate()
const END_MONTH = dayjs().add(CALENDAR_YEARS_SPAN, "year").endOf("year").toDate()

interface DateTimeInputProps extends InputComponentProps {
  autoFocus?: boolean
}

/**
 * Free-form date text, with a calendar and a time field in a popover opened
 * from the button on its left.
 * Picking a day keeps the typed time (or its absence), editing the time keeps
 * the picked day, and clearing the time leaves the date alone.
 * The value is always a string, so anything dayjs parses can still be typed.
 */
export const DateTimeInput: FC<DateTimeInputProps> = (props) => {
  const { label, fieldKey, value = "", readOnly, autoFocus, onValueChange } = props

  const parsed = dayjs(value)
  const isValid = value.trim().length > 0 && parsed.isValid()
  const selected = isValid ? parsed : undefined
  const hasTime = isValid && TIME_PATTERN.test(value)

  const [isOpen, setIsOpen] = useState(false)
  const [month, setMonth] = useState(() => (selected ?? dayjs()).toDate())
  const anchorRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  /**
   * Dismiss on outside click or Escape. Clicks on the button are handled by
   * `togglePicker`, which closes the popover on its own
   */
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

  const togglePicker = () => {
    if (!isOpen) {
      setMonth((selected ?? dayjs()).toDate())
    }
    setIsOpen(!isOpen)
  }

  const commit = (date: Dayjs, format = DATE_TIME_FORMAT) => {
    onValueChange(date.format(format))
    setMonth(date.toDate())
  }

  const onTextChange: InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    onValueChange(event.target.value)
  }

  const onDaySelect = (day?: Date) => {
    if (!day) {
      return
    }

    if (!selected || !hasTime) {
      commit(dayjs(day), DATE_FORMAT)
      return
    }

    commit(dayjs(day)
      .hour(selected.hour())
      .minute(selected.minute())
      .second(selected.second())
      .millisecond(selected.millisecond()))
  }

  const clearTime = () => {
    if (selected) {
      commit(selected, DATE_FORMAT)
    }
  }

  const onTimeChange: InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const [hour = 0, minute = 0, second = 0] = event.target.value.split(":").map(Number)
    commit((selected ?? dayjs()).hour(hour).minute(minute).second(second))
  }

  return (
    <div className="DateTimeInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <div className="DateTimeInput-field">
        <RCTooltip
          prefixCls="DateTimeInput-popover"
          visible={isOpen}
          trigger={[]}
          placement="bottomLeft"
          destroyTooltipOnHide
          zIndex={1000}
          overlay={(
            <div className="DateTimeInput-popover-panel" ref={popupRef} role="dialog" aria-label={label}>
              <DayPicker
                mode="single"
                showOutsideDays
                captionLayout="dropdown"
                startMonth={START_MONTH}
                endMonth={END_MONTH}
                selected={selected?.toDate()}
                onSelect={onDaySelect}
                month={month}
                onMonthChange={setMonth}
              />
              <div className="DateTimeInput-popover-time">
                {hasTime
                  ? (
                    <input
                      type="time"
                      step={1}
                      value={selected?.format("HH:mm:ss")}
                      onChange={onTimeChange}
                    />
                  )
                  : (
                    <button
                      type="button"
                      className="DateTimeInput-popover-empty-time"
                      onClick={() => { commit((selected ?? dayjs()).startOf("day")) }}
                    >
                      No time set
                    </button>
                  )}
                {hasTime && (
                  <Tooltip overlay="Clear time">
                    <Button
                      type="button"
                      className="DateTimeInput-popover-clear"
                      icon={Icons.Close}
                      aria-label="Clear time"
                      onClick={clearTime}
                    />
                  </Tooltip>
                )}
                <Button type="button" onClick={() => { commit(dayjs().millisecond(0)) }}>
                  Now
                </Button>
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
            aria-label="Pick date and time"
            aria-expanded={isOpen}
          >
            <Icons.Calendar size={15} />
          </button>
        </RCTooltip>
        <input
          value={value}
          onChange={onTextChange}
          readOnly={readOnly}
          tabIndex={readOnly ? -1 : undefined}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder={DATE_TIME_FORMAT}
        />
      </div>
    </div>
  )
}
