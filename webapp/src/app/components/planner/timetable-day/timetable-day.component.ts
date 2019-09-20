import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ClassSession, TimetableSession, DAY_LENGTH, DAY_START_TIME, ClassStream } from 'src/app/calendar/calendar';

@Component({
  selector: 'app-timetable-day',
  templateUrl: './timetable-day.component.html',
  styleUrls: ['./timetable-day.component.css'],
})
export class TimetableDayComponent implements OnInit {
  @Input()
  public sessionList: TimetableSession[];
  @Output()
  public sessionClick: EventEmitter<TimetableSession> = new EventEmitter<TimetableSession>();

  @Input()
  public editing: boolean;
  @Input()
  public editingClassName: string;
  @Input()
  public editingClassType: string;
  @Input()
  public selections: Map<string, Map<string, ClassStream>>;

  constructor() {

  }

  ngOnInit() {

  }

  public handleClicked(session: TimetableSession) {
    if(this.displaySessionAsEditing(session) || !this.editing) {
      this.sessionClick.emit(session);
    }
  }

  public displaySessionAsEditing(session: TimetableSession): boolean {
    return this.editing
        && this.editingClassName === session.className
        && this.editingClassType === session.classType;
  }

  public displaySessionAsNotEditing(session: TimetableSession): boolean {
    return this.editing && !this.displaySessionAsEditing(session);
  }

  public getSessionTopPercentage(session: ClassSession): number {
    const relativeTime: number = session.startTime.hours
      - DAY_START_TIME.hours;
    return 100 * (relativeTime / DAY_LENGTH);
  }

  public getSessionHeightPercentage(session: ClassSession): number {
    const length: number = session.endTime.hours - session.startTime.hours;
    return 100 * (length / DAY_LENGTH);
  }
}
