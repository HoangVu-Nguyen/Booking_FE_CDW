import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomAmenities } from './room-amenities';

describe('RoomAmenities', () => {
  let component: RoomAmenities;
  let fixture: ComponentFixture<RoomAmenities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomAmenities],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomAmenities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
