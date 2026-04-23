import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaSeleccionComponent } from './area-seleccion';

describe('AreaSeleccion', () => {
  let component: AreaSeleccionComponent;
  let fixture: ComponentFixture<AreaSeleccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaSeleccionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AreaSeleccionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
