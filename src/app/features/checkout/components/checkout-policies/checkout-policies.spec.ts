import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutPolicies } from './checkout-policies';

describe('CheckoutPolicies', () => {
  let component: CheckoutPolicies;
  let fixture: ComponentFixture<CheckoutPolicies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutPolicies],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutPolicies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
