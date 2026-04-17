import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesAsistenciaComponent } from './reportes-asistencia';

describe('ReportesAsistencia', () => {
  let component: ReportesAsistenciaComponent;
  let fixture: ComponentFixture<ReportesAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesAsistenciaComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ReportesAsistenciaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
