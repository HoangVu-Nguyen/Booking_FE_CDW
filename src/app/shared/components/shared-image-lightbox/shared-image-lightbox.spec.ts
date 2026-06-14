import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedImageLightbox } from './shared-image-lightbox';

describe('SharedImageLightbox', () => {
  let component: SharedImageLightbox;
  let fixture: ComponentFixture<SharedImageLightbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedImageLightbox],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedImageLightbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
