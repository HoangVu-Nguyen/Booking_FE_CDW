import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastTripList } from './past-trip-list';

describe('PastTripList', () => {
  let component: PastTripList;
  let fixture: ComponentFixture<PastTripList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastTripList],
    }).compileComponents();

    fixture = TestBed.createComponent(PastTripList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
