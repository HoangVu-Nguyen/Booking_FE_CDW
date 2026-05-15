import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextSteps } from './next-steps';

describe('NextSteps', () => {
  let component: NextSteps;
  let fixture: ComponentFixture<NextSteps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NextSteps],
    }).compileComponents();

    fixture = TestBed.createComponent(NextSteps);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
