import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWalletApproval } from './admin-wallet-approval';

describe('AdminWalletApproval', () => {
  let component: AdminWalletApproval;
  let fixture: ComponentFixture<AdminWalletApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminWalletApproval],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminWalletApproval);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
