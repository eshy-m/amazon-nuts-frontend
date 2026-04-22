import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlOperacionesComponent } from './control-operaciones';

describe('ControlOperaciones', () => {
  let component: ControlOperacionesComponent;
  let fixture: ComponentFixture<ControlOperacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlOperacionesComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ControlOperacionesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
