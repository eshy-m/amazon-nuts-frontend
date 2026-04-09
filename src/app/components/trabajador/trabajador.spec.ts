import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrabajadorComponent } from './trabajador';

describe('Trabajador', () => {
  let component: TrabajadorComponent;
  let fixture: ComponentFixture<TrabajadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Trabajador]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Trabajador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
