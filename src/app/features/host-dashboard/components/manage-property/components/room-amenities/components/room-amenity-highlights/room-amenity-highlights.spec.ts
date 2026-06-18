import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomAmenityHighlights } from './room-amenity-highlights';

describe('RoomAmenityHighlights', () => {
  let component: RoomAmenityHighlights;
  let fixture: ComponentFixture<RoomAmenityHighlights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomAmenityHighlights],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomAmenityHighlights);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
