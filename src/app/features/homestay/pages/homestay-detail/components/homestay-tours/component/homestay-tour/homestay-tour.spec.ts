import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomestayTour } from './homestay-tour';

describe('HomestayTour', () => {
  let component: HomestayTour;
  let fixture: ComponentFixture<HomestayTour>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomestayTour],
    }).compileComponents();

    fixture = TestBed.createComponent(HomestayTour);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
