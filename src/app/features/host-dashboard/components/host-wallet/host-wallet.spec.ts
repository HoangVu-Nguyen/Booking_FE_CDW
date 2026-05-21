import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostWallet } from './host-wallet';

describe('HostWallet', () => {
  let component: HostWallet;
  let fixture: ComponentFixture<HostWallet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostWallet],
    }).compileComponents();

    fixture = TestBed.createComponent(HostWallet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
