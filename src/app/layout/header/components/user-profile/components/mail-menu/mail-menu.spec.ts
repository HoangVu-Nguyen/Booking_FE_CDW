import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailMenu } from './mail-menu';

describe('MailMenu', () => {
  let component: MailMenu;
  let fixture: ComponentFixture<MailMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(MailMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
