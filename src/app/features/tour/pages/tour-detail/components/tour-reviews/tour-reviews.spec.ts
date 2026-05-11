import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourReviews } from './tour-reviews';

describe('TourReviews', () => {
  let component: TourReviews;
  let fixture: ComponentFixture<TourReviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourReviews],
    }).compileComponents();

    fixture = TestBed.createComponent(TourReviews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
