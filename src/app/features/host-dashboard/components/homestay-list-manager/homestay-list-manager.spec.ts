import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomestayListManager } from './homestay-list-manager';

describe('HomestayListManager', () => {
  let component: HomestayListManager;
  let fixture: ComponentFixture<HomestayListManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomestayListManager],
    }).compileComponents();

    fixture = TestBed.createComponent(HomestayListManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
