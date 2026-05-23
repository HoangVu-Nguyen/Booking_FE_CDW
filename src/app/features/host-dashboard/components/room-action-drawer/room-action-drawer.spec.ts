import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomActionDrawer } from './room-action-drawer';

describe('RoomActionDrawer', () => {
  let component: RoomActionDrawer;
  let fixture: ComponentFixture<RoomActionDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomActionDrawer],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomActionDrawer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
