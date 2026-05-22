import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingDetailModal } from './booking-detail-modal';

describe('BookingDetailModal', () => {
  let component: BookingDetailModal;
  let fixture: ComponentFixture<BookingDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingDetailModal],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingDetailModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
