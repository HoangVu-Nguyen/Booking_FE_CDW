import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyDetailDrawer } from './property-detail-drawer';

describe('PropertyDetailDrawer', () => {
  let component: PropertyDetailDrawer;
  let fixture: ComponentFixture<PropertyDetailDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyDetailDrawer],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyDetailDrawer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
