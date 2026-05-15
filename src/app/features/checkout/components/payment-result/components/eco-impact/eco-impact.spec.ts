import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcoImpact } from './eco-impact';

describe('EcoImpact', () => {
  let component: EcoImpact;
  let fixture: ComponentFixture<EcoImpact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcoImpact],
    }).compileComponents();

    fixture = TestBed.createComponent(EcoImpact);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
