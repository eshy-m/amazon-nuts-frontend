import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaSecado } from './area-secado';

describe('AreaSecado', () => {
  let component: AreaSecado;
  let fixture: ComponentFixture<AreaSecado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaSecado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaSecado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
