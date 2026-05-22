import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hosts } from './hosts';

describe('Hosts', () => {
  let component: Hosts;
  let fixture: ComponentFixture<Hosts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hosts],
    }).compileComponents();

    fixture = TestBed.createComponent(Hosts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
