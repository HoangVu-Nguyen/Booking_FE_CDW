import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostDetail } from './host-detail';

describe('HostDetail', () => {
  let component: HostDetail;
  let fixture: ComponentFixture<HostDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(HostDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
