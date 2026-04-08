import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesAsistencia } from './reportes-asistencia';

describe('ReportesAsistencia', () => {
  let component: ReportesAsistencia;
  let fixture: ComponentFixture<ReportesAsistencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesAsistencia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesAsistencia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
