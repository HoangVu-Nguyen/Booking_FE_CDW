import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCardModal } from './add-card-modal';

describe('AddCardModal', () => {
  let component: AddCardModal;
  let fixture: ComponentFixture<AddCardModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCardModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCardModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
