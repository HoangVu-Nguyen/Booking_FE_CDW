import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourHero } from './tour-hero';

describe('TourHero', () => {
  let component: TourHero;
  let fixture: ComponentFixture<TourHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourHero],
    }).compileComponents();

    fixture = TestBed.createComponent(TourHero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
