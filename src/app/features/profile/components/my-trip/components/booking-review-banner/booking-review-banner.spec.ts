import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingReviewBanner } from './booking-review-banner';

describe('BookingReviewBanner', () => {
  let component: BookingReviewBanner;
  let fixture: ComponentFixture<BookingReviewBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingReviewBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingReviewBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
