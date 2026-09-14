import { useEffect, useMemo, useRef, useState } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

const toIso = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromIso = (iso: string): Date => {
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const startOfDay = (iso: string): number => fromIso(iso).setHours(0, 0, 0, 0);

interface DateCalendarProps {
  value: string;
  min?: string;
  onSelect: (iso: string) => void;
  onClose: () => void;
}

export const DateCalendar = ({ value, min, onSelect, onClose }: DateCalendarProps): JSX.Element => {
  const selected = fromIso(value);
  const [cursor, setCursor] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const panelRef = useRef<HTMLDivElement>(null);
  const todayIso = toIso(new Date());
  const minTime = startOfDay(min || todayIso);

  useEffect(() => {
    const onPointer = (event: MouseEvent): void => {
      if (!panelRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };
    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', onPointer);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [onClose]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const blanks = Array.from({ length: firstWeekday }, () => null);
    const days = Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1));
    return [...blanks, ...days];
  }, [cursor]);

  const title = cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="tv-cal" ref={panelRef} role="dialog" aria-label="Choose date">
      <div className="tv-cal-nav">
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          aria-label="Previous month"
        >
          <MdChevronLeft className="tv-icon" aria-hidden />
        </button>
        <strong>{title}</strong>
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          aria-label="Next month"
        >
          <MdChevronRight className="tv-icon" aria-hidden />
        </button>
      </div>
      <div className="tv-cal-grid">
        {WEEKDAYS.map((day) => (
          <span key={day} className="tv-cal-dow">
            {day}
          </span>
        ))}
        {cells.map((date, index) => {
          if (!date) {
            return <span key={`empty-${index}`} />;
          }
          const iso = toIso(date);
          const disabled = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() < minTime;
          const selectedDay = iso === value;
          const today = iso === todayIso;
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              className={`${selectedDay ? 'is-selected' : ''} ${today ? 'is-today' : ''}`}
              onClick={() => onSelect(iso)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
