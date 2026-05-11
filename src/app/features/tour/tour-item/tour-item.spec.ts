import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourItem } from './tour-item';

describe('TourItem', () => {
  let component: TourItem;
  let fixture: ComponentFixture<TourItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourItem],
    }).compileComponents();

    fixture = TestBed.createComponent(TourItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
