import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyOverview } from './journey-overview';

describe('JourneyOverview', () => {
  let component: JourneyOverview;
  let fixture: ComponentFixture<JourneyOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JourneyOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(JourneyOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
