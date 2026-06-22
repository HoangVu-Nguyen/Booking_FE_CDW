import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomPolicies } from './room-policies';

describe('RoomPolicies', () => {
  let component: RoomPolicies;
  let fixture: ComponentFixture<RoomPolicies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomPolicies],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomPolicies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
