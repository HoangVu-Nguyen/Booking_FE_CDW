import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrip } from './my-trip';

describe('MyTrip', () => {
  let component: MyTrip;
  let fixture: ComponentFixture<MyTrip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTrip],
    }).compileComponents();

    fixture = TestBed.createComponent(MyTrip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
