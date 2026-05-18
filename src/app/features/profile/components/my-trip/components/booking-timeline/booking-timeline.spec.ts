import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingTimeline } from './booking-timeline';

describe('BookingTimeline', () => {
  let component: BookingTimeline;
  let fixture: ComponentFixture<BookingTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingTimeline],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingTimeline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
