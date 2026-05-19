import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomestayItem } from './homestay-item';

describe('HomestayItem', () => {
  let component: HomestayItem;
  let fixture: ComponentFixture<HomestayItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomestayItem],
    }).compileComponents();

    fixture = TestBed.createComponent(HomestayItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
