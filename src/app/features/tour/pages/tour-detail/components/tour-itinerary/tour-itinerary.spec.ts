import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourItinerary } from './tour-itinerary';

describe('TourItinerary', () => {
  let component: TourItinerary;
  let fixture: ComponentFixture<TourItinerary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourItinerary],
    }).compileComponents();

    fixture = TestBed.createComponent(TourItinerary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
