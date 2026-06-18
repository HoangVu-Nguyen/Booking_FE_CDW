import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatePlanBenefits } from './rate-plan-benefits';

describe('RatePlanBenefits', () => {
  let component: RatePlanBenefits;
  let fixture: ComponentFixture<RatePlanBenefits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatePlanBenefits],
    }).compileComponents();

    fixture = TestBed.createComponent(RatePlanBenefits);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
