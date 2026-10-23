import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MygallaryComponent } from './mygallary.component';

describe('MygallaryComponent', () => {
  let component: MygallaryComponent;
  let fixture: ComponentFixture<MygallaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MygallaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MygallaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
