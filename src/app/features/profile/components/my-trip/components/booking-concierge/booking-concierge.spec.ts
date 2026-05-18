import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingConcierge } from './booking-concierge';

describe('BookingConcierge', () => {
  let component: BookingConcierge;
  let fixture: ComponentFixture<BookingConcierge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingConcierge],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingConcierge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
