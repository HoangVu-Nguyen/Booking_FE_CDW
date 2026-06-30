import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiRoomFinder } from './ai-room-finder';

describe('AiRoomFinder', () => {
  let component: AiRoomFinder;
  let fixture: ComponentFixture<AiRoomFinder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiRoomFinder],
    }).compileComponents();

    fixture = TestBed.createComponent(AiRoomFinder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
