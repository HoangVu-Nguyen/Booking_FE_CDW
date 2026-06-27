import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityInfo } from './identity-info';

describe('IdentityInfo', () => {
  let component: IdentityInfo;
  let fixture: ComponentFixture<IdentityInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentityInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(IdentityInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
