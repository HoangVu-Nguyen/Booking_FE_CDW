import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomestayTours } from './homestay-tours';

describe('HomestayTours', () => {
  let component: HomestayTours;
  let fixture: ComponentFixture<HomestayTours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomestayTours],
    }).compileComponents();

    fixture = TestBed.createComponent(HomestayTours);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
