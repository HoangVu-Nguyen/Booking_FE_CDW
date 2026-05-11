import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourBookingCard } from './tour-booking-card';

describe('TourBookingCard', () => {
  let component: TourBookingCard;
  let fixture: ComponentFixture<TourBookingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourBookingCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TourBookingCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
