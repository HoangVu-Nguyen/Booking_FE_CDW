import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingRulesModal } from './booking-rules-modal';

describe('BookingRulesModal', () => {
  let component: BookingRulesModal;
  let fixture: ComponentFixture<BookingRulesModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingRulesModal],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingRulesModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
