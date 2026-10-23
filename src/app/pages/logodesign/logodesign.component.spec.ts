import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogodesignComponent } from './logodesign.component';

describe('LogodesignComponent', () => {
  let component: LogodesignComponent;
  let fixture: ComponentFixture<LogodesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogodesignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogodesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
