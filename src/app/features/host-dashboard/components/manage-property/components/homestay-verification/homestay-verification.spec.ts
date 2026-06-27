import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomestayVerification } from './homestay-verification';

describe('HomestayVerification', () => {
  let component: HomestayVerification;
  let fixture: ComponentFixture<HomestayVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomestayVerification],
    }).compileComponents();

    fixture = TestBed.createComponent(HomestayVerification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
