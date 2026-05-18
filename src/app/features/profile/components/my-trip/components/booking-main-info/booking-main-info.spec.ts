import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingMainInfo } from './booking-main-info';

describe('BookingMainInfo', () => {
  let component: BookingMainInfo;
  let fixture: ComponentFixture<BookingMainInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingMainInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingMainInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
