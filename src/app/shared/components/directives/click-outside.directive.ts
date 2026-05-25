import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true 
})
export class ClickOutsideDirective {
  @Output() appClickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: any): void {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    
    // Nếu click ra bên ngoài -> Phát ra một sự kiện báo cho Component biết
    if (!clickedInside) {
      this.appClickOutside.emit();
    }
  }
}