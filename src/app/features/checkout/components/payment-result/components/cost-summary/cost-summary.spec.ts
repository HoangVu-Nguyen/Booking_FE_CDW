import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostSummary } from './cost-summary';

describe('CostSummary', () => {
  let component: CostSummary;
  let fixture: ComponentFixture<CostSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(CostSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
