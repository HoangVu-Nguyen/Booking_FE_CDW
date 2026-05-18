import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingMap } from './booking-map';

describe('BookingMap', () => {
  let component: BookingMap;
  let fixture: ComponentFixture<BookingMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingMap],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
