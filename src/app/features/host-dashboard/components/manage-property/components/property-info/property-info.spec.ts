import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyInfo } from './property-info';

describe('PropertyInfo', () => {
  let component: PropertyInfo;
  let fixture: ComponentFixture<PropertyInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
