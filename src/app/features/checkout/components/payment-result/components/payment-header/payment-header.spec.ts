import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentHeader } from './payment-header';

describe('PaymentHeader', () => {
  let component: PaymentHeader;
  let fixture: ComponentFixture<PaymentHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
