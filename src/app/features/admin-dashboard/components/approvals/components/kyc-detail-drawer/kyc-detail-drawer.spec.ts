import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycDetailDrawer } from './kyc-detail-drawer';

describe('KycDetailDrawer', () => {
  let component: KycDetailDrawer;
  let fixture: ComponentFixture<KycDetailDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycDetailDrawer],
    }).compileComponents();

    fixture = TestBed.createComponent(KycDetailDrawer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
