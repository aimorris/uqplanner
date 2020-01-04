import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PlannerService } from 'src/app/calendar/planner.service';
import { Plan } from 'src/app/calendar/calendar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-weeks',
  templateUrl: './weeks.component.html',
  styleUrls: ['./weeks.component.css']
})
export class WeeksComponent implements OnInit {
  public startDate: Date | undefined;
  public lastWeek: number;
  public firstWeek: number;

  public weeks: number[] = [];
  public weekContents: boolean[] = [];
  public weekNames: string[] = [];

  @Output()
  public weekChanged: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();

  private weekSelected: number | undefined = undefined;

  public planSub: Subscription;

  public constructor(private plannerService: PlannerService) {
    this.planSub = this.plannerService.currentPlan.asObservable().subscribe(
      (plan: Plan) => {
        if(plan && plan.classes.length > 0) {
          this.startDate = new Date(this.getStartDate(plan));
          this.lastWeek  = this.getLastWeek(plan);
          this.firstWeek = this.getFirstWeek(plan);

          this.weeks = [...Array(this.lastWeek - this.firstWeek).keys()].map((v, i, a) => i);
          this.weekContents = this.getWeekContents(plan);
          this.weekNames = this.getWeekNames();
        }
      }
    );
  }

  public ngOnInit() { }

  public ngOnDestroy() {
    this.planSub.unsubscribe();
  }

  public selectWeek(week: number | undefined): void {
    this.weekSelected = week;
    this.weekChanged.emit(this.firstWeek + week);
  }

  public isSelected(week: number | undefined): boolean {
    return this.weekSelected === week;
  }

  public calculateWeekStartDate(week: number): Date {
    let date = new Date(this.startDate);
    date.setDate(this.startDate.getDate() + ((this.firstWeek + week) * 7));
    return date;
  }
  
  private getStartDate(plan: Plan): Date | undefined {
    if(!plan || plan.classes.length == 0) {
      return undefined;
    } else {
      return plan.classes[0].classes[0].streams[0].classes[0].startDate || undefined;
    }
  }

  private getFirstWeek(plan: Plan): number {
    if(!plan || plan.classes.length === 0) {
      return undefined;
    } else {
      let earliestWeek = 50;
      
      plan.classes.forEach(clazz => {
        clazz.classes.forEach(type => {
          type.streams.forEach(stream => {
            stream.classes.forEach(session => {
              if(session.weekPattern) {
                let first = session.weekPattern.indexOf((1 as unknown) as boolean);
                earliestWeek = first < earliestWeek ? first : earliestWeek;
              }
            })
          })
        })
      });

      return earliestWeek;
    }
  }

  private getLastWeek(plan: Plan): number {
    if(!plan || plan.classes.length === 0) {
      return undefined;
    } else {
      let latestWeek = 0;
      
      plan.classes.forEach(clazz => {
        clazz.classes.forEach(type => {
          type.streams.forEach(stream => {
            stream.classes.forEach(session => {
              if(session.weekPattern) {
                let last = session.weekPattern.lastIndexOf((1 as unknown) as boolean);
                latestWeek = last > latestWeek ? last : latestWeek;
              }
            })
          })
        })
      });

      return latestWeek + 1;
    }
  }

  private getWeekContents(plan: Plan): boolean[] {
    if(!plan || plan.classes.length === 0) {
      return []
    } else {
      let contents = this.weeks.map(week => false);

      plan.classes.forEach(clazz => {
        clazz.classes.forEach(type => {
          type.streams.forEach(stream => {
            stream.classes.forEach(session => {
              if(session.weekPattern) {
                contents = contents.map((v, i, a) => v || session.weekPattern[this.firstWeek + i]);
              }
            })
          })
        })
      });

      return contents;
    }
  }

  private getWeekNames(): string[] {
    let weekNumber = 1;

    return (this.weekContents.map(active => {
      return active ? `${weekNumber++}` : 'Break'
    }));
  }
}
