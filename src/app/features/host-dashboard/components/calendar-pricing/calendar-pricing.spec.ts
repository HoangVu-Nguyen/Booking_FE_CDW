import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarPricing } from './calendar-pricing';

describe('CalendarPricing', () => {
  let component: CalendarPricing;
  let fixture: ComponentFixture<CalendarPricing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarPricing],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarPricing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
