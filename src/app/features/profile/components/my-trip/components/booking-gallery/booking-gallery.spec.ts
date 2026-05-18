import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingGallery } from './booking-gallery';

describe('BookingGallery', () => {
  let component: BookingGallery;
  let fixture: ComponentFixture<BookingGallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingGallery],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingGallery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
