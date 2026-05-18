import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomestayWishlist } from './homestay-wishlist';

describe('HomestayWishlist', () => {
  let component: HomestayWishlist;
  let fixture: ComponentFixture<HomestayWishlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomestayWishlist],
    }).compileComponents();

    fixture = TestBed.createComponent(HomestayWishlist);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
