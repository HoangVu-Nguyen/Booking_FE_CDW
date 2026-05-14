import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutContact } from './checkout-contact';

describe('CheckoutContact', () => {
  let component: CheckoutContact;
  let fixture: ComponentFixture<CheckoutContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutContact],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutContact);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
