import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyAmenities } from './property-amenities';

describe('PropertyAmenities', () => {
  let component: PropertyAmenities;
  let fixture: ComponentFixture<PropertyAmenities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyAmenities],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyAmenities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
