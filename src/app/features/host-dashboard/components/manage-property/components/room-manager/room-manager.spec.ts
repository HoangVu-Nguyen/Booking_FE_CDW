import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomManager } from './room-manager';

describe('RoomManager', () => {
  let component: RoomManager;
  let fixture: ComponentFixture<RoomManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomManager],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
