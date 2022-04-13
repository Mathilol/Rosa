import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventEmitter } from '@angular/core';

interface AvailabilityPeriod {
  startAt: string;
  endAt: string;
}

type DateAndAvailabilities = {
  date: Date;
  availabilities: Date[];
};

@Component({
  selector: 'rosa-appointment-calendar',
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.css'],
})
export class AppointmentCalendarComponent implements OnInit, AfterViewInit {
  @ViewChild('appointmentCalendarTable')
  appointmentCalendarTable: ElementRef | undefined;

  @Input()
  public set motiveId(motiveId: string) {
    this._motiveId = motiveId;
    if (motiveId) {
      this.fetchAvailabilities();
    }
  }

  get motiveId() {
    return this._motiveId;
  }

  @Output() setSelectedDate: EventEmitter<{ selectedDate: Date }> =
    new EventEmitter<{ selectedDate: Date }>();

  private dates: DateAndAvailabilities[] = [];
  private _motiveId = '';
  shownDates: DateAndAvailabilities[] = [];
  dateIndex = 0;
  numberOfShownDates = 0;
  shownRowsIndexes: number[] = Array.from(Array(5).keys());
  shownColumnsIndexes: number[] = [];
  maxAmountOfShownRows = 5;
  selectedDate: Date | null = null;

  private _availabilities: BehaviorSubject<Date[]> = new BehaviorSubject<Date[]>([]);
  readonly availabilities$: Observable<Date[]> = this._availabilities.asObservable();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.dates = this.getDaysArray(new Date(Date.now()), 30);
    this.updateShownDates(this.dateIndex);
    this.availabilities$.subscribe((availabilities) => {
      this.shownDates.forEach(
        (ad) =>
          (ad.availabilities = availabilities.filter(
            (a) =>
              a.getDate() === ad.date.getDate() &&
              a.getMonth() === ad.date.getMonth()
          ))
      );
      this.maxAmountOfShownRows = Math.max(
        ...this.shownDates.map((sd) => sd.availabilities.length)
      );
    });
  }

  ngAfterViewInit() {
    this.calculateNumberOfDates();
  }

  updateShownDates(index: number) {
    if (index < 0) index = 0;
    this.shownDates = this.dates.slice(index, index + this.numberOfShownDates);
    this.shownDates.forEach((sd) => (sd.availabilities = []));
    this.dateIndex = index;
    if (this.motiveId !== '') {
      this.fetchAvailabilities();
    }
  }

  getDaysArray(start: Date, numberOfDays: number) {
    return Array.from(Array(numberOfDays).keys()).map((daysToAdd) => {
      const date = new Date(start);
      date.setDate(start.getDate() + daysToAdd);

      return {
        date: date,
        availabilities: [],
      };
    });
  }

  getMonth(date: Date): string {
    return date.toLocaleString('default', { month: 'short' });
  }

  calculateNumberOfDates() {
    const newValue = Math.floor(this.appointmentCalendarTable?.nativeElement.offsetWidth / 65) - 1;
    if (newValue !== this.numberOfShownDates) {
      this.numberOfShownDates = newValue;
      this.shownColumnsIndexes = Array.from(
        Array(this.numberOfShownDates).keys()
      );
      this.updateShownDates(this.dateIndex);
    }
  }

  fetchAvailabilities() {
    this.http
      .get<AvailabilityPeriod[]>(
        `https://staging-api.rosa.be/api/availabilities?from=${this.shownDates[0]?.date.toISOString()}&to=${this.shownDates[this.numberOfShownDates - 1]?.date.toISOString()}&motive_id=${this.motiveId}&is_new_patient=false&calendar_ids=61379ba159d4940022b6c928&state=open`
      )
      .subscribe((a) =>
        this._availabilities.next(this.getAllAvailabilities(a))
      );
  }

  getAllAvailabilities(availPeriods: AvailabilityPeriod[]): Date[] {
    return availPeriods.reduce((previousValue: Date[], currentValue) => {
      return [
        ...previousValue,
        ...this.getAvailabilitiesBetween(
          new Date(currentValue.startAt),
          new Date(currentValue.endAt)
        ),
      ];
    }, []);
  }

  getAvailabilitiesBetween(startDate: Date, endDate: Date): Date[] {
    const arr: Date[] = [];
    const dt = new Date(startDate);
    for (dt; dt < endDate; dt.setTime(dt.getTime() + 30 * 60000)) {
      arr.push(new Date(dt));
    }
    return arr;
  }

  setSelectedDateEmitter(date: Date) {
    this.setSelectedDate.emit({ selectedDate: date });
    this.selectedDate = date;
  }

  showAllAppointments() {
    this.shownRowsIndexes = Array.from(Array(this.maxAmountOfShownRows).keys());
  }
}
